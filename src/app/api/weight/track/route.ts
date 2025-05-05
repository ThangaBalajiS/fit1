import { NextResponse } from 'next/server';
import { generateAIFeedback } from '@/lib/openai';
import { connectDB } from '@/lib/db';
import { z } from 'zod';
import { Weight } from '@/models/Weight';
import { User } from '@/models/User';

const weightInputSchema = z.object({
  weight: z.number(),
  date: z.string(),
  userDetails: z.any().optional()
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const cookie = request.headers.get('cookie');
    let userId = cookie?.split('fit1-session=')[1] || '';
    userId = userId.split(';')[0];
    const body = await request.json();
    const validatedData = weightInputSchema.parse(body);
    const { weight, date, userDetails } = validatedData;

    // Save the weight entry
    const weightEntry = new Weight({
      userId,
      weight,
      date,
      timestamp: new Date()
    });
    await weightEntry.save();

    // Update the user's weight in their profile
    await User.findByIdAndUpdate(
      userId,
      { 'userDetails.weight': weight },
      { new: true }
    );

    // Generate AI feedback if user details are provided
    let aiFeedback = null;
    if (userDetails) {
      aiFeedback = await generateAIFeedback(userDetails, 'weight', { weight }, null);
    }

    return NextResponse.json({
      success: true,
      data: weightEntry,
      aiFeedback
    });
  } catch (error) {
    console.error('Error processing weight data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 400 }
    );
  }
} 