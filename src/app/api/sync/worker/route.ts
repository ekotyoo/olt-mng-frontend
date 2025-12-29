import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncFromOlt } from "@/lib/sync-service";
import { revalidatePath } from "next/cache";

export const maxDuration = 300; // 5 minutes max duration

function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}

async function triggerNextJob() {
    const pendingCount = await prisma.syncJob.count({
        where: { status: "PENDING" }
    });

    if (pendingCount > 0) {
        const url = `${getBaseUrl()}/api/sync/worker`;
        console.log(`[Worker] Triggering next job (${pendingCount} remaining) at:`, url);
        fetch(url, { method: "POST" }).catch(e => console.error("Chain trigger failed:", e));
    } else {
        console.log("[Worker] No more pending jobs.");
    }
}

export async function POST(req: Request) {
    // 1. Find the next pending job
    const job = await prisma.syncJob.findFirst({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
    });

    if (!job) {
        return NextResponse.json({ message: "No pending jobs" });
    }

    try {
        // 2. Mark as processing
        await prisma.syncJob.update({
            where: { id: job.id },
            data: { status: "PROCESSING" },
        });

        // 3. Execute Sync
        const result = await syncFromOlt(job.oltId || undefined);

        // 4. Mark as completed
        await prisma.syncJob.update({
            where: { id: job.id },
            data: {
                status: "COMPLETED",
                log: JSON.stringify(result)
            },
        });

        revalidatePath("/", "layout");

        // 5. Chain next job
        await triggerNextJob();

        return NextResponse.json({ success: true, jobId: job.id, result });
    } catch (error: any) {
        console.error("Sync Job Failed:", error);

        // 5. Mark as failed
        await prisma.syncJob.update({
            where: { id: job.id },
            data: {
                status: "FAILED",
                log: error.message || "Unknown error"
            },
        });

        // 6. Chain next job even on failure
        await triggerNextJob();

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
