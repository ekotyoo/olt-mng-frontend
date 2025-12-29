"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const NasSchema = z.object({
    nasname: z.string().min(1, "IP Address is required"), // IP Address
    shortname: z.string().optional(),
    type: z.string().default("mikrotik"),
    secret: z.string().min(1, "Shared Secret is required"),
    description: z.string().optional(),
});

export async function getNasList() {
    return await prisma.nas.findMany({
        orderBy: { nasname: 'asc' }
    });
}

export async function createNas(data: z.infer<typeof NasSchema>) {
    const validated = NasSchema.parse(data);

    try {
        await prisma.nas.create({
            data: {
                nasname: validated.nasname,
                shortname: validated.shortname,
                type: validated.type,
                secret: validated.secret,
                description: validated.description
            }
        });
        revalidatePath("/settings/nas");
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error("A NAS with this IP address already exists.");
        }
        throw error;
    }
}

export async function deleteNas(id: number) {
    await prisma.nas.delete({
        where: { id }
    });
    revalidatePath("/settings/nas");
    return { success: true };
}
