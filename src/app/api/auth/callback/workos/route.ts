import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { workos } from '@/lib/workos';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import { User } from '@/models/User';

// Define User schema if not already define

// Get or create User model

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    console.log('code', code);

    if (!code) {
      return NextResponse.redirect('/auth/error?error=No authorization code provided');
    }

    // Get user profile from WorkOS
    const authResponse = await workos.userManagement.authenticateWithCode({
      code,
      clientId: process.env.WORKOS_CLIENT_ID!,
    });

    console.log('authResponse', authResponse);

    if (!authResponse.user) {
      return NextResponse.redirect('/auth/error?error=Failed to authenticate user');
    }

    const user = authResponse.user;

    // Connect to database
    await connectDB();

    // Find or create user
    let dbUser = await User.findOne({ workosId: user.id });

    if (!dbUser) {
      // Create new user
      dbUser = await User.create({
        email: user.email,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
        picture: user.profilePictureUrl,
        workosId: user.id,
        lastLogin: new Date(),
      });
    } else {
      // Update last login
      dbUser.lastLogin = new Date();
      if (user.profilePictureUrl) dbUser.picture = user.profilePictureUrl;
      await dbUser.save();
    }

    // Create response with redirect
    const response = NextResponse.redirect(searchParams.get('state') || 'http://localhost:3000');

    // Set session cookie
    response.cookies.set('fit1-session', dbUser._id.toString(), {
      // httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // 7 days
      maxAge: 7 * 24 * 60 * 60,
    });

    // Set accessToken and refreshToken cookies if present
    if (authResponse.accessToken) {
      response.cookies.set('fit1-access-token', authResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }
    if (authResponse.refreshToken) {
      response.cookies.set('fit1-refresh-token', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect('/auth/error?error=Authentication failed');
  }
} 