"use server";

import { prisma } from "@/lib/db";
import { getOltConnectionParams } from "./olt";
import { runOltSession } from "@/lib/telnet-service";
import { parseAttenuationInfo, parseAllOnuStatuses } from "@/lib/olt-parser";
import { revalidatePath } from "next/cache";

export async function getLiveOnlineOnus(oltId: string): Promise<string[]> {
    const params = await getOltConnectionParams(oltId);

    return await runOltSession(async (session) => {
        const onuStateRaw = await session.sendCommand("show gpon onu state");
        const statuses = parseAllOnuStatuses(onuStateRaw);

        // Filter working
        return statuses
            .filter(s => s.status === "working")
            .map(s => `${s.slotPort}:${s.onuId}`);
    }, params);
}

export type AuditTarget = {
    id: string; // Database ID of the ONU
    slotPort: string;
    onuId: string;
    serial: string;
};

export type AuditResult = {
    onuId: string; // Database ID
    rx: number;
    tx: number;
    level: "critical" | "warning" | "good";
    status: "success" | "failed";
    error?: string;
};

export async function auditSignalBatch(oltId: string, targets: AuditTarget[]): Promise<AuditResult[]> {
    const params = await getOltConnectionParams(oltId);
    const results: AuditResult[] = [];

    try {
        await runOltSession(async (session) => {
            for (const target of targets) {
                try {
                    // Command: show pon power attenuation gpon-onu_1/2/3:1
                    const cmd = `show pon power attenuation gpon-onu_${target.slotPort}:${target.onuId}`;
                    const raw = await session.sendCommand(cmd);

                    const info = parseAttenuationInfo(raw);

                    // Extract metrics
                    // Downstream: OLT -> ONU (Rx at ONU)
                    const downstream = info.find(i => i.direction === 'down');
                    // Upstream: ONU -> OLT (Rx at OLT)
                    const upstream = info.find(i => i.direction === 'up');

                    const rx = downstream?.rx ?? -99;
                    const tx = upstream?.rx ?? -99;

                    // Classify
                    let level: "critical" | "warning" | "good" = "good";
                    if (rx < -27) level = "critical";
                    else if (rx < -25) level = "warning";

                    // Save to DB
                    // We need to ensure prisma.onuSignalHistory exists (User manual update)
                    await prisma.onuSignalHistory.create({
                        data: {
                            onuId: target.id,
                            rxPower: rx,
                            txPower: tx,
                            level: level
                        }
                    });

                    results.push({
                        onuId: target.id,
                        rx,
                        tx,
                        level,
                        status: "success"
                    });

                } catch (e) {
                    console.error(`Error auditing ONU ${target.serial}`, e);
                    results.push({
                        onuId: target.id,
                        rx: 0,
                        tx: 0,
                        level: "critical",
                        status: "failed",
                        error: "Command failed"
                    });
                }
            }
        }, params);
    } catch (e) {
        console.error("Audit session failed", e);
        // Mark all as failed if session breaks
        return targets.map(t => ({
            onuId: t.id,
            rx: 0,
            tx: 0,
            level: "critical",
            status: "failed",
            error: "Session failed"
        }));
    }

    revalidatePath("/health");
    return results;
}

export async function getAuditHistory(limit = 50) {
    return await prisma.onuSignalHistory.findMany({
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
            onu: {
                select: {
                    name: true,
                    serial: true,
                    slotPort: true,
                    ponPort: {
                        select: {
                            olt: {
                                select: { name: true }
                            }
                        }
                    }
                }
            }
        }
    });
}

export async function getAuditStats() {
    // Return counts for today? OR most recent entry per ONU?
    // Complex query. For MVP, let's just count the history table for the last 24h?
    // Or simpler: The Dashboard will calculate stats based on the latest scan.
    // Let's rely on the frontend to display the "Live Scan" results.
    return {};
}
