/**
 * Next.js middleware for route protection
 * Protects /app and /admin routes
 * Redirects unauthorized users to login
 * Note: Simplified to work with Edge Runtime - JWT verification happens in server components
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('mespod_session')?.value;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  // Static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if user is trying to access protected routes
  const isAppRoute = pathname.startsWith('/app');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAppRoute || isAdminRoute) {
    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Token exists - let the page component verify it
    // (JWT verification doesn't work in Edge Runtime)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
