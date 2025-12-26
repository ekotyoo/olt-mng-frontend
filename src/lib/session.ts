import { env } from "@/env";
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = env.AUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
    userId: string;
    email: string;
    name?: string;
    expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        });
        return payload as unknown as SessionPayload;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: string, email: string, name?: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, email, name, expiresAt });

    (await cookies()).set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    const payload = await decrypt(session);

    if (!payload) return null;

    return payload;
}

export async function deleteSession() {
    (await cookies()).delete('session');
}
