import { NextResponse } from 'next/server';
import { analyzeFoodIntake } from '@/lib/openai';
import { storeNutritionData } from '@/lib/vectorstore';
import { FoodIntake } from '@/types/nutrition';
import { connectDB } from '@/lib/db';
import { z } from 'zod';

const foodIntakeSchema = z.object({
  food: z.string(),
  time: z.string(),
});

export async function POST(request: Request) {
  try {
    // Ensure database connection
    await connectDB();
    //cookie is a string of the user id
    const cookie = request.headers.get('cookie');
    let userId = cookie?.split('=')[1] || '';
    userId = userId.split(';')[0];
    const body = await request.json();
    const validatedData = foodIntakeSchema.parse(body);
    const { ...foodIntake } = validatedData;

    // Analyze food intake using OpenAI
    const analysis = await analyzeFoodIntake(foodIntake);
    console.log(analysis);
    // Store in MongoDB
    const storedData = await storeNutritionData(userId, foodIntake, analysis);

    return NextResponse.json({
      success: true,
      data: storedData,
    });
  } catch (error) {
    console.error('Error processing food intake:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 400 }
    );
  }
} 