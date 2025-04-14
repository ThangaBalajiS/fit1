import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';

// Initialize MongoDB connection
let isConnecting = false;
const initDB = async () => {
  if (!isConnecting) {
    isConnecting = true;
    try {
      await connectDB();
      console.log('✅ MongoDB connected successfully via middleware');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
    }
    isConnecting = false;
  }
};

export async function middleware(request: NextRequest) {
  await initDB();
  return NextResponse.next();
}

// Configure middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
}; 