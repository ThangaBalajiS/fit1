import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect('http://localhost:3000/api/auth/signin');
  
  // Clear the session cookie
  response.cookies.delete('fit1-session');
  
  return response;
} 