"use server";

import { prisma } from "@/lib/db";

export async function getCommandLogs() {
    return await prisma.commandLog.findMany({
        orderBy: { executedAt: "desc" },
        take: 50, // Limit to last 50 commands
    });
}
