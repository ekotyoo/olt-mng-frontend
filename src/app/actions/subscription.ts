"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteSubscription(subscriptionId: string) {
    try {
        await prisma.subscription.delete({
            where: {
                id: subscriptionId
            }
        });

        revalidatePath("/customers/[id]", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete subscription:", error);
        return { success: false, error: "Failed to delete subscription" };
    }
}
