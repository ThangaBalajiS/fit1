import { NextResponse } from 'next/server';
import { analyzeFoodIntake } from '@/lib/openai';
import { storeNutritionData } from '@/lib/vectorstore';
import { FoodIntake } from '@/types/nutrition';
import { connectDB } from '@/lib/db';
import { z } from 'zod';

const foodIntakeSchema = z.object({
  userId: z.string(),
  food: z.string(),
  time: z.string(),
});

export async function POST(request: Request) {
  try {
    // Ensure database connection
    await connectDB();
    
    const body = await request.json();
    const validatedData = foodIntakeSchema.parse(body);
    const { userId, ...foodIntake } = validatedData;

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