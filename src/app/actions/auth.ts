'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { hashPassword, verifyPassword } from '@/lib/password'
import { redirect } from 'next/navigation'

const signupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
    email: z.string().email({ message: 'Invalid email address' }).trim(),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
        .regex(/[0-9]/, { message: 'Contain at least one number.' })
        .trim(),
})

const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
})

export type FormState = {
    errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
    }
    message?: string
}

export async function signup(prevState: FormState, formData: FormData) {
    const validatedFields = signupSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, email, password } = validatedFields.data
    const hashedPassword = await hashPassword(password)

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return {
                errors: {
                    email: ['User with this email already exists']
                }
            }
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        await createSession(user.id, user.email, user.name || undefined)
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create User.',
        }
    }

    redirect('/')
}

export async function login(prevState: FormState, formData: FormData) {
    const validatedFields = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { email, password } = validatedFields.data

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            // Return generic error for security
            return { message: 'Invalid credentials' }
        }

        const passwordsMatch = await verifyPassword(password, user.password)

        if (!passwordsMatch) {
            return { message: 'Invalid credentials' }
        }

        await createSession(user.id, user.email, user.name || undefined)
    } catch (error) {
        return {
            message: 'Database Error: Failed to Login.',
        }
    }

    redirect('/')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
