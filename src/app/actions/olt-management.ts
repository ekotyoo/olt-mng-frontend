"use server";

import { prisma } from "@/lib/db";
import { Olt } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getOlts() {
    return await prisma.olt.findMany({
        orderBy: { createdAt: "asc" }
    });
}

// Minimal type for OLT creation/update
export type OltInput = {
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    type: string;
}

export async function createOlt(data: OltInput) {
    try {
        const olt = await prisma.olt.create({
            data: {
                ...data,
                // Initialize stats
                cpuUsage: 0,
                memoryUsage: 0,
                temperature: 0
            }
        });
        revalidatePath("/");
        revalidatePath("/settings/olts");
        return { success: true, olt };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateOlt(id: string, data: OltInput) {
    try {
        const olt = await prisma.olt.update({
            where: { id },
            data
        });
        revalidatePath("/");
        revalidatePath("/settings/olts");
        return { success: true, olt };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteOlt(id: string) {
    try {
        await prisma.olt.delete({
            where: { id }
        });
        revalidatePath("/");
        revalidatePath("/settings/olts");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
