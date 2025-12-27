"use server";

import { syncFromOlt } from "@/lib/sync-service";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

export async function triggerSync(oltId?: string) {
    try {
        const result = await syncFromOlt(oltId);
        revalidatePath("/", "layout");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Sync failed:", error);
        return { success: false, error: error.message };
    }
}

export async function triggerGlobalSync() {
    try {
        const olts = await prisma.olt.findMany({ select: { id: true } });
        const results = await Promise.allSettled(olts.map(o => syncFromOlt(o.id)));

        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
            console.error("Some OLTs failed to sync", failures);
            // We return success partially, but maybe warn? 
            // For UI simplicity, we just say done, but maybe return count.
        }

        revalidatePath("/", "layout");
        return { success: true, count: olts.length, failures: failures.length };
    } catch (error: any) {
        console.error("Global Sync failed:", error);
        return { success: false, error: error.message };
    }
}
