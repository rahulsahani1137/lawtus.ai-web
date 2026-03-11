import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/chat', '/drafts', '/documents']

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
    const hasRefreshToken = request.cookies.has('lawtus_refresh')

    if (isProtected && !hasRefreshToken) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
