export const runtime = 'edge';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public paths that don't require authentication
const publicPaths = new Set([
  '/api/auth/signin',
  '/api/auth/callback/workos',
  '/api/auth/signout',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/providers',
  '/api/auth/error',
  '/auth/error',
]);

function isPublicPath(path: string): boolean {
  // Check if it's a public auth path
  if (publicPaths.has(path)) {
    return true;
  }

  // Check for static files and auth-related paths
  return (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth/') ||
    path.endsWith('.ico') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.svg') ||
    path.startsWith('/public/')
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log('🔒 Checking auth for path:', path);

  // Skip auth check for public paths
  if (isPublicPath(path)) {
    console.log('✅ Public path, skipping auth check:', path);
    return NextResponse.next();
  }

  // Check for fit1-session cookie
  const sessionCookie = request.cookies.get('fit1-session');
  console.log('🍪 Session cookie found:', !!sessionCookie);

  if (!sessionCookie && path === '/') {
    console.log('❌ No session cookie found, redirecting to sign-in');
    // Store the attempted URL to redirect back after auth
    const searchParams = new URLSearchParams({
      callbackUrl: request.url,
    });
    
    // Redirect to WorkOS sign-in if not authenticated
    const signInUrl = new URL('/api/auth/signin', request.url);
    signInUrl.search = searchParams.toString();
    return NextResponse.redirect(signInUrl);
  }

  console.log('✅ Auth check passed, proceeding to:', path);
  return NextResponse.next();
}

// Configure middleware to match all paths
export const config = {
  matcher: [
    /*
     * Match all paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 