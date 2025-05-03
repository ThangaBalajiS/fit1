import { NextResponse } from 'next/server';
import { analyzeWaterIntake } from '@/lib/openai';
import { storeWaterData } from '@/lib/vectorstore';
import { connectDB } from '@/lib/db';
import { WaterIntake } from '@/types/water';
import { User } from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    const cookie = request.headers.get('cookie');
    let userId = cookie?.split('fit1-session=')[1] || '';
    userId = userId.split(';')[0];
    const body = await request.json();
    const { amount, time, date } = body;
    if (!amount || !time || !date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Fetch user to get water goal
    const user = await User.findById(userId);
    const goal = user?.userDetails?.waterIntakeRecommended || 2000;
    const waterIntake: WaterIntake = {
      amount: Number(amount),
      type: 'water',
      time,
    };
    const analysis = await analyzeWaterIntake(waterIntake, goal);
    const storedData = await storeWaterData(userId, waterIntake, analysis);
    return NextResponse.json({ success: true, data: storedData });
  } catch (error) {
    console.error('Error processing water intake:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 400 }
    );
  }
} 