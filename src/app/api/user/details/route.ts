import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { z } from 'zod';
import OpenAI from 'openai';

// Validation schema for user details
const userDetailsSchema = z.object({
  height: z.number().min(1).max(300),
  weight: z.number().min(1).max(500),
  age: z.number().min(1).max(150),
  gender: z.enum(['male', 'female', 'other']),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
  dailyCaloriesRecommended: z.number().min(1).max(5000).optional(),
  waterIntakeRecommended: z.number().min(1).max(5000).optional(),
  sleepDurationRecommended: z.number().min(1).max(24).optional(),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
    // const validatedData = userDetailsSchema.parse(body);
    
    // Calculate additional user metrics based on the validated data
    const extendedData = {
      ...body,
      ...await calculateAdditionalMetrics(body)
    };
    
    await connectDB();
    
    const user = await User.findById(sessionId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('extendedData', extendedData);

    const updatedUser = await User.findOneAndUpdate(
      { _id: sessionId }, 
      { userDetails: extendedData }, 
      { new: true }
    );
    console.log('updatedUser', updatedUser);

    // Return the updated user details
    return NextResponse.json({ 
      success: true,
      userDetails: updatedUser?.userDetails 
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

// Function to calculate additional metrics based on user details using OpenAI
async function calculateAdditionalMetrics(data: z.infer<typeof userDetailsSchema>) {
  console.log('calculateAdditionalMetrics', data);
  try {
    // Create a detailed user profile for OpenAI to understand
    const userProfile = `
    User Profile:
    - Height: ${data.height} cm
    - Weight: ${data.weight} kg
    - Age: ${data.age} years
    - Gender: ${data.gender}
    - Fitness Goal: ${data.goal.replace('_', ' ')}
    - Activity Level: ${data.activityLevel.replace('_', ' ')}
    `;

    // Create a system prompt for OpenAI with specific instructions
    const systemPrompt = `
    You are an expert fitness and health consultant with knowledge of nutrition, exercise science, and sleep science.
    Based on the user profile provided, calculate the following metrics with scientific accuracy:
    
    1. Daily Calorie Needs: Consider BMR, activity level, and fitness goal. Use appropriate formulas.
    2. Daily Water Intake: Calculate in milliliters based on weight and activity level.
    3. Optimal Sleep Duration: Recommend hours based on age and activity level.
    
    Return ONLY a JSON object with these fields: dailyCaloriesRecommended, waterIntakeRecommended, sleepDurationRecommended.
    All numbers must be integers. Ensure waterIntakeRecommended is in milliliters and dailyCaloriesRecommended is an integer.
    `;

    const userMessage = `Based on this user profile, calculate the health metrics:\n${userProfile}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      response_format: { type: "json_object" }
    });

    // Extract and parse the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }
    console.log('responseContent', responseContent);
    const metrics = JSON.parse(responseContent);
    
    // Validate the response against our schema
    return {
      dailyCaloriesRecommended: Math.min(Math.max(Math.round(Number(metrics.dailyCaloriesRecommended)), 1), 5000),
      waterIntakeRecommended: Math.min(Math.max(Math.round(Number(metrics.waterIntakeRecommended)), 1), 5000),
      sleepDurationRecommended: Math.min(Math.max(Math.round(Number(metrics.sleepDurationRecommended)), 1), 24),
    };
  } catch (error) {
    console.error('Error calculating metrics with OpenAI:', error);
    
    // Fallback to local calculation if OpenAI fails
    return fallbackCalculateMetrics(data);
  }
}

// Fallback function for local calculation if OpenAI fails
function fallbackCalculateMetrics(data: z.infer<typeof userDetailsSchema>) {
  const { height, weight, age, gender, goal, activityLevel } = data;
  
  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Apply activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };
  
  let dailyCalories = Math.round(bmr * activityMultipliers[activityLevel]);
  
  // Adjust calories based on goal
  if (goal === 'weight_loss') {
    dailyCalories = Math.round(dailyCalories * 0.8); // 20% deficit
  } else if (goal === 'muscle_gain') {
    dailyCalories = Math.round(dailyCalories * 1.1); // 10% surplus
  }
  
  // Calculate recommended water intake (ml) - general rule is 30-35ml per kg of body weight
  const waterIntake = Math.round(weight * 33);
  
  // Calculate recommended sleep duration based on age
  let sleepDuration = 8; // default for adults
  if (age < 18) {
    sleepDuration = 9;
  } else if (age > 65) {
    sleepDuration = 7;
  }
  
  // Default values for metrics that require user input over time
  const sleepQuality = 7;
  const stressLevel = 5;
  
  // Determine sleep schedule based on goal and activity level
  let sleepSchedule: 'early_bird' | 'night_owl' | 'average' = 'average';
  if (activityLevel === 'very_active' || activityLevel === 'extremely_active') {
    sleepSchedule = 'early_bird';
  } else if (goal === 'muscle_gain') {
    sleepSchedule = 'early_bird';
  } else if (activityLevel === 'sedentary') {
    sleepSchedule = 'night_owl';
  }
  
  return {
    dailyCalories,
    waterIntake,
    sleepDuration,
    sleepQuality,
    stressLevel,
    sleepSchedule
  };
}

export async function GET() {
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