"use server";

import { syncFromOlt } from "@/lib/sync-service";
import { revalidatePath } from "next/cache";

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
