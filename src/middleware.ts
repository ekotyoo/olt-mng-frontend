import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

// 1. Specify protected and public routes
const publicRoutes = ['/login', '/register', '/']

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname
    // Check if the path starts with any of the public routes
    const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/portal')

    // 3. Decrypt the session from the cookie
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    // 4. Redirect to /login if the user is not authenticated and the route is not public
    if (!isPublicRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    // 5. Redirect to /dashboard if the user is authenticated and on login page
    if ((path === '/login' || path === '/register') && session?.userId) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }

    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
