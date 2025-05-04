import { NextResponse } from 'next/server';

export async function middleware() {
  // Perform stateless checks here (e.g., cookies, headers)
  return NextResponse.next();
}

// Configure middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
}; 