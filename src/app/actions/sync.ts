"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { env } from "@/env";
import { headers } from "next/headers";

function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}

async function triggerWorker() {
    const url = `${getBaseUrl()}/api/sync/worker`;
    console.log("Triggering worker at:", url);
    // Fire and forget (hope it runs)
    fetch(url, { method: "POST" }).catch(e => console.error("Worker trigger failed:", e));
}

export async function triggerSync(oltId?: string) {
    try {
        await prisma.syncJob.create({
            data: {
                oltId: oltId,
                status: "PENDING"
            }
        });

        // Trigger worker without waiting
        triggerWorker();

        revalidatePath("/", "layout");
        return { success: true, message: "Sync Queued" };
    } catch (error: any) {
        console.error("Sync Trigger failed:", error);
        return { success: false, error: error.message };
    }
}

export async function triggerGlobalSync() {
    try {
        // Global sync = sync job with no OLT ID? Or multiple jobs?
        // Let's create one job with oltId = null, worker handles finding all OLTs?
        // Or create multiple jobs?
        // Let's create multiple jobs for robustness
        const olts = await prisma.olt.findMany({ select: { id: true } });

        await prisma.$transaction(
            olts.map(o => prisma.syncJob.create({
                data: { oltId: o.id, status: "PENDING" }
            }))
        );

        triggerWorker();

        revalidatePath("/", "layout");
        return { success: true, count: olts.length, message: "Global Sync Queued" };
    } catch (error: any) {
        console.error("Global Sync failed:", error);
        return { success: false, error: error.message };
    }
}
