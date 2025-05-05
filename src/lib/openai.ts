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

export async function generateAIFeedback(
  userDetails: any, 
  entryType: 'food' | 'water' | 'weight', 
  entryData: any,
  analysis?: any
): Promise<string> {
  let prompt = '';

  if (entryType === 'food') {
    prompt = `Generate personalized health feedback about this food entry based on the user's profile and goals.
    
User Profile:
- Height: ${userDetails?.height || 'N/A'} cm
- Weight: ${userDetails?.weight || 'N/A'} kg
- Age: ${userDetails?.age || 'N/A'}
- Gender: ${userDetails?.gender || 'N/A'}
- Goal: ${userDetails?.goal || 'N/A'} 
- Activity Level: ${userDetails?.activityLevel || 'N/A'}
- Daily Calorie Recommendation: ${userDetails?.dailyCaloriesRecommended || 'N/A'} kcal

Food Entry: ${entryData.food}
Analysis: ${JSON.stringify(analysis)}

Provide a brief, personalized and helpful comment (2-3 sentences maximum) about this meal choice in relation to their fitness goals. Include specific nutrients they're getting or might be missing. Be conversational, encouraging, and provide actionable advice if relevant.`;
  } else if (entryType === 'water') {
    prompt = `Generate personalized health feedback about this water intake based on the user's profile and goals.
    
User Profile:
- Height: ${userDetails?.height || 'N/A'} cm
- Weight: ${userDetails?.weight || 'N/A'} kg
- Age: ${userDetails?.age || 'N/A'}
- Gender: ${userDetails?.gender || 'N/A'}
- Goal: ${userDetails?.goal || 'N/A'} 
- Activity Level: ${userDetails?.activityLevel || 'N/A'}
- Daily Water Recommendation: ${userDetails?.waterIntakeRecommended || 'N/A'} mL

Water Intake: ${entryData.amount} mL

Provide a brief, personalized and helpful comment (2-3 sentences maximum) about this water intake in relation to their hydration needs. Be conversational, encouraging, and provide actionable advice if relevant.`;
  } else if (entryType === 'weight') {
    // Calculate BMI if height is available
    let bmi = '';
    let weightDiff = '';

    if (userDetails?.height && entryData.weight) {
      const heightInMeters = userDetails.height / 100;
      const calculatedBmi = (entryData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      bmi = `\nCalculated BMI: ${calculatedBmi}`;
    }

    if (userDetails?.weight && entryData.weight) {
      const diff = (entryData.weight - userDetails.weight).toFixed(2);
      const diffNum = Number(diff);
      const isGain = diffNum > 0;
      if (Math.abs(diffNum) > 0.05) { // Only mention if change > 50g
        weightDiff = `\nWeight change: ${isGain ? '+' : ''}${diff} kg compared to previous record`;
      }
    }

    prompt = `Generate personalized health feedback about this weight entry based on the user's profile and goals.
    
User Profile:
- Height: ${userDetails?.height || 'N/A'} cm
- Current Weight: ${entryData.weight} kg${weightDiff}
- Age: ${userDetails?.age || 'N/A'}
- Gender: ${userDetails?.gender || 'N/A'}
- Goal: ${userDetails?.goal || 'N/A'} 
- Activity Level: ${userDetails?.activityLevel || 'N/A'}${bmi}

Provide a brief, personalized and helpful comment (2-3 sentences maximum) about this weight in relation to their fitness goals. Include relevant health insights based on the BMI (if available) and weight change. Be conversational, encouraging, and provide actionable advice relevant to their specific goal (weight_loss, muscle_gain, maintenance, etc).`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a friendly and encouraging fitness coach and nutritionist. Provide concise, personalized feedback that's positive but realistic."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  if (!response.choices[0].message.content) {
    return "Great job tracking your progress!";
  }

  return response.choices[0].message.content.trim();
} 