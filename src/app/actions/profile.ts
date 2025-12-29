'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';
import { revalidatePath } from 'next/cache';

const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional(), // Optional if we plan to allow email updates later
});

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[a-zA-Z]/, 'Contain at least one letter.')
        .regex(/[0-9]/, 'Contain at least one number.'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type ProfileActionState = {
    error?: string;
    success?: string;
    fieldErrors?: Record<string, string[]>;
};

export async function updateProfile(prevState: ProfileActionState, formData: FormData) {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: "Unauthorized" };
    }

    const validated = updateProfileSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
    });

    if (!validated.success) {
        return { fieldErrors: validated.error.flatten().fieldErrors };
    }

    try {
        await prisma.user.update({
            where: { id: session.userId },
            data: { name: validated.data.name }
        });

        revalidatePath('/profile');
        return { success: "Profile updated successfully" };
    } catch (e) {
        return { error: "Failed to update profile" };
    }
}

export async function changePassword(prevState: ProfileActionState, formData: FormData) {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: "Unauthorized" };
    }

    const validated = changePasswordSchema.safeParse({
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
    });

    if (!validated.success) {
        return { fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { currentPassword, newPassword } = validated.data;

    try {
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) return { error: "User not found" };

        const isValid = await verifyPassword(currentPassword, user.password);
        if (!isValid) {
            return { error: "Incorrect current password" };
        }

        const hashed = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: session.userId },
            data: { password: hashed }
        });

        return { success: "Password changed successfully" };
    } catch (e) {
        return { error: "Failed to change password" };
    }
}
