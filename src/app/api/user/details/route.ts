import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { z } from 'zod';

// Validation schema for user details
const userDetailsSchema = z.object({
  height: z.number().min(1).max(300),
  weight: z.number().min(1).max(500),
  age: z.number().min(1).max(150),
  gender: z.enum(['male', 'female', 'other']),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
});

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('fit1-session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = userDetailsSchema.parse(body);
    
    await connectDB();
    
    const user = await User.findById(sessionId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await User.findOneAndUpdate({_id: sessionId}, {name: "summa", userDetails: validatedData}, {new: true})
    console.log('updatedUser', updatedUser);
   /*  // Update user details
    user.userDetails = validatedData;
    user.markModified('userDetails'); // Ensure mongoose knows the object was modified
    console.log('user', user);
    const a = await user.save();
    console.log('a', a);
 */
    // Return the updated user details
    return NextResponse.json({ 
      success: true,
      userDetails: updatedUser.userDetails 
    });

  } catch (error) {
    console.error('Error updating user details:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid data',
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('fit1-session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(sessionId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ userDetails: user.userDetails || null });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 