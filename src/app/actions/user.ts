"use server";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        }
    });
}

export async function createUser(data: any) {
    // Validate email
    const existing = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (existing) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role || "VIEWER",
            status: "ACTIVE"
        }
    });

    revalidatePath("/settings/users");
    return { success: true };
}

export async function deleteUser(userId: string) {
    // Count users to prevent deleting the last one
    const count = await prisma.user.count();
    if (count <= 1) {
        throw new Error("Cannot delete the last user");
    }

    await prisma.user.delete({
        where: { id: userId }
    });

    revalidatePath("/settings/users");
    return { success: true };
}
