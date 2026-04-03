import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication Middleware
 * 
 * Protects routes that require authentication and redirects unauthenticated users to login.
 * Uses PASETO tokens stored in cookies for authentication.
 */

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/',
];

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/login',
  '/register',
];

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/drafts',
  '/documents',
  '/chat',
  '/onboarding',
  '/c',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get access token from cookie
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  // Check if the route is an auth route (login/register)
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter to return to the original page after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
