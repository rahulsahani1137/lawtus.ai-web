import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/"];

// Routes that authenticated users shouldn't access (excludes "/" since it's the home page)
const authRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth token in cookies or localStorage reference
    // Note: We're checking for the presence of the refresh token cookie/storage marker
    const authStorage = request.cookies.get("lawtus-auth-storage");
    const isAuthenticated = authStorage?.value?.includes('"isAuthenticated":true');

    // If user is authenticated and trying to access auth routes (login/register), redirect to chat
    // Note: "/" is NOT included here - authenticated users can still access the home page
    if (isAuthenticated && authRoutes.some((route) => pathname === route || (pathname.startsWith(route) && route !== "/"))) {
        return NextResponse.redirect(new URL("/c", request.url));
    }

    // If user is not authenticated and trying to access protected routes
    if (!isAuthenticated && !publicRoutes.some((route) => pathname.startsWith(route))) {
        // Allow access to static files and API routes
        if (
            pathname.startsWith("/_next") ||
            pathname.startsWith("/api") ||
            pathname.includes(".")
        ) {
            return NextResponse.next();
        }

        // Redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
