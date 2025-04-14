import OpenAI from 'openai';
import { NutritionAnalysis, FoodIntake } from '@/types/nutrition';

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
  recommendations: string[];
} 
  
Food Intake Details:
${JSON.stringify(foodIntake)}

Provide accurate estimates for:
1. Total calories
2. Macronutrient breakdown (protein, carbs, fats, fiber)
3. Nutritional recommendations

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