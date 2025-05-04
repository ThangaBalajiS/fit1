import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { workos } from '@/lib/workos';
//use jose to decode jwt token
import { decodeJwt } from 'jose';

export async function GET() {
  //workos signout
  //decode jwt token
  const cookieStore = await cookies();
  const token = cookieStore.get('fit1-access-token')?.value;
  if (!token) {
    return NextResponse.redirect('tryfit1.netlify.app/api/auth/signin');
  }
  const decodedToken = await decodeJwt(token);
  //workos signout
  const sessionId = decodedToken.sid as string;
  console.log('sessionId', sessionId);
  // Clear the session cookie
  cookieStore.delete('fit1-session');
  cookieStore.delete('fit1-access-token');
  cookieStore.delete('fit1-refresh-token');
  const logoutUrl = workos.userManagement.getLogoutUrl({ sessionId });
  console.log('logoutUrl', logoutUrl);
  return NextResponse.json({ redirectUrl: logoutUrl });
} 