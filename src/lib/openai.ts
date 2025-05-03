import OpenAI from 'openai';
import { NutritionAnalysis, FoodIntake } from '@/types/nutrition';
import { WaterIntake, WaterAnalysis } from '@/types/water';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeFoodIntake(foodIntake: FoodIntake): Promise<NutritionAnalysis> {
  const prompt = `Analyze the following food intake and provide detailed nutritional information including calories and macros. Format the response as JSON matching the NutritionAnalysis type.

  here's the NutritionAnalysis type:
  {
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  meal: { // meal wise breakdown
    name: string; // meal of the day
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  }

  foods: { // dish wise breakdown
  name: string; // dish name
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    };
  }[];
} 
  
Food Intake Details:
${JSON.stringify(foodIntake)}

Provide accurate estimates for:
1. Total calories
2. Macronutrient breakdown (protein, carbs, fats, fiber)

Response must be valid JSON.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a precise nutritionist AI that analyzes food intake and provides detailed nutritional information. Always respond with valid JSON matching the NutritionAnalysis type."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  if (!response.choices[0].message.content) {
    throw new Error('No response from OpenAI');
  }

  const analysis = JSON.parse(response.choices[0].message.content) as NutritionAnalysis;
  return analysis;
}

export async function analyzeWaterIntake(waterIntake: WaterIntake, goal: number): Promise<WaterAnalysis> {
  const prompt = `Analyze the following water intake and provide a detailed analysis. Format the response as JSON matching the WaterAnalysis type.

here's the WaterAnalysis type:
{
  totalIntake: number; // Total daily intake in milliliters
  goal: number; // Daily goal in milliliters
  completionRate: number; // Percentage of goal completed
  intakePattern: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  hydrationStatus: 'optimal' | 'adequate' | 'insufficient';
}

Water Intake Details:
${JSON.stringify(waterIntake)}
Daily Goal: ${goal} mL

Provide accurate estimates for:
1. Total intake for the day
2. Completion rate (percentage of goal)
3. Intake pattern (split into morning, afternoon, evening)
4. Hydration status (optimal, adequate, insufficient)

Response must be valid JSON.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a precise hydration AI that analyzes water intake and provides detailed hydration information. Always respond with valid JSON matching the WaterAnalysis type."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  if (!response.choices[0].message.content) {
    throw new Error('No response from OpenAI');
  }

  const analysis = JSON.parse(response.choices[0].message.content) as WaterAnalysis;
  return analysis;
} 