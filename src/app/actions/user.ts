'use server'

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { revalidatePath } from 'next/cache';

const userSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email(),
    role: z.enum(['ADMIN', 'VIEWER']),
    status: z.enum(['ACTIVE', 'DISABLED']),
    password: z.string().min(8).optional(), // Optional for updates
});

export async function getUsers() {
    // Cast to any because Prisma types might be stale in the editor context
    return await (prisma as any).user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
        }
    });
}

export async function createUser(data: z.infer<typeof userSchema> & { password: string }) {
    // Validate
    const result = userSchema.safeParse(data);
    if (!result.success) {
        return { error: 'Invalid data' };
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return { error: 'Email already exists' };

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    await (prisma as any).user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            status: data.status,
        }
    });

    revalidatePath('/settings/users');
    return { success: true };
}

export async function updateUser(id: string, data: Partial<z.infer<typeof userSchema>>) {
    const updateData: any = { ...data };

    // If password provided, hash it
    if (data.password && data.password.trim() !== "") {
        updateData.password = await hashPassword(data.password);
    } else {
        delete updateData.password;
    }

    try {
        await (prisma as any).user.update({
            where: { id },
            data: updateData
        });
        revalidatePath('/settings/users');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to update user' };
    }
}

export async function deleteUser(id: string) {
    try {
        await (prisma as any).user.delete({ where: { id } });
        revalidatePath('/settings/users');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to delete user' };
    }
}
