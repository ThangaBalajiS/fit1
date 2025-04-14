import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/workos';

export async function GET() {
  try {
    const authorizationUrl = await getAuthorizationUrl();
    console.log(authorizationUrl);
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error('Error generating authorization URL:', error);
    return NextResponse.redirect('/auth/error');
  }
} 