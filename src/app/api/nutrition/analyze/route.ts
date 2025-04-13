import { NextResponse } from 'next/server';
import { analyzeFoodIntake } from '@/lib/openai';
import { storeNutritionData } from '@/lib/vectorstore';
import { FoodIntake } from '@/types/nutrition';
import { z } from 'zod';

const foodIntakeSchema = z.object({
    food: z.string(),
    time: z.string(),
  })

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validatedData = foodIntakeSchema.parse(body);
    const foodIntake: FoodIntake = validatedData;

    // Analyze food intake using OpenAI
    const analysis = await analyzeFoodIntake(foodIntake);
    console.log(analysis);
    // Store in vector database
    await storeNutritionData(foodIntake, analysis);

    return NextResponse.json({
      success: true,
      data: analysis,
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