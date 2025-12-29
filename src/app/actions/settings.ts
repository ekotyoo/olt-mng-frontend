"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getBillingSettings() {
    const dueDay = await prisma.systemSetting.findUnique({ where: { key: "billing_due_day" } });
    const maxUnpaid = await prisma.systemSetting.findUnique({ where: { key: "billing_max_unpaid" } });

    return {
        dueDay: dueDay ? parseInt(dueDay.value) : 20, // Default 20th
        maxUnpaid: maxUnpaid ? parseInt(maxUnpaid.value) : 2, // Default 2 months
    };
}

export async function updateBillingSettings(dueDay: number, maxUnpaid: number) {
    await prisma.systemSetting.upsert({
        where: { key: "billing_due_day" },
        update: { value: dueDay.toString() },
        create: { key: "billing_due_day", value: dueDay.toString(), description: "Day of month when invoices are due" }
    });

    await prisma.systemSetting.upsert({
        where: { key: "billing_max_unpaid" },
        update: { value: maxUnpaid.toString() },
        create: { key: "billing_max_unpaid", value: maxUnpaid.toString(), description: "Max unpaid invoices before suspension" }
    });

    revalidatePath("/settings/billing");
    return { success: true };
}
