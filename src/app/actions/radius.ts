"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type RadiusSession = {
    id: string; // Converted from BigInt
    username: string;
    ipAddress: string;
    startTime: Date;
    duration: number; // Seconds
    upload: number; // Bytes
    download: number; // Bytes
    macAddress: string;
};

export async function getLiveSessions(): Promise<RadiusSession[]> {
    // Fetch sessions where acctStopTime is NULL (Active)
    const sessions = await prisma.radAcct.findMany({
        where: {
            acctStopTime: null
        },
        orderBy: {
            acctStartTime: 'desc'
        }
    });

    return sessions.map(s => {
        const startTime = s.acctStartTime || new Date();
        const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

        return {
            id: s.radAcctId.toString(),
            username: s.username,
            ipAddress: s.framedIpAddress || s.nasIpAddress || "-",
            startTime: startTime,
            duration: duration,
            upload: Number(s.acctInputOctets || 0),
            download: Number(s.acctOutputOctets || 0),
            macAddress: s.callingStationId || "-"
        };
    });
}

export async function disconnectSession(sessionId: string) {
    // 1. Fetch Session Info
    const session = await prisma.radAcct.findUnique({
        where: { radAcctId: BigInt(sessionId) }
    });

    if (!session) return { success: false, error: "Session not found" };

    // 2. Find NAS (Router) Secret
    // We match the NAS IP from the session to our configured Routers
    const nas = await prisma.nas.findUnique({
        where: { nasname: session.nasIpAddress }
    });

    let coaResult = { success: true, message: "Simulated Disconnect (No NAS found)" };

    if (nas) {
        // 3. Send CoA Packet
        const { sendDisconnectPacket } = await import("@/lib/radius/coa");
        coaResult = await sendDisconnectPacket(
            nas.nasname,
            nas.secret,
            session.acctSessionId,
            session.username
        );

        if (!coaResult.success) {
            console.error(`CoA Failed for ${session.username}: ${coaResult.message}`);
            // We might want to return here, or continue to force-close in DB
            // Let's continue to close in DB but warn user
        }
    }

    // 4. Close Session in DB (Always do this to keep DB clean)
    await prisma.radAcct.update({
        where: { radAcctId: BigInt(sessionId) },
        data: {
            acctStopTime: new Date(),
            acctTerminateCause: nas ? "Admin-Reset" : "Admin-Force-Close"
        }
    });

    revalidatePath("/radius/sessions");

    if (nas && !coaResult.success) {
        // Return error if we tried to kick but failed
        return { success: false, error: `DB Updated, but Router Refused: ${coaResult.message}` };
    }

    return { success: true };
}
