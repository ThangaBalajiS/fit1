import { NextResponse } from 'next/server';
import { queryNutritionForDate } from '@/lib/vectorstore';
import { connectDB } from '@/lib/db';

function getTodayDate() {
  const now = new Date();
  let month = String(now.getMonth()+1);
  let date = String(now.getDate());
  if (parseInt(month) < 10) {
    month = '0' + month;
  }
  if (parseInt(date) < 10) {
    date = '0' + date;
  }
  return now.getFullYear() + "-" + month + "-" + date;
  // return now.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const cookie = request.headers.get('cookie');
    let userId = cookie?.split('fit1-session=')[1] || '';
    userId = userId.split(';')[0];
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || getTodayDate();
    console.log('date 22', date);
    const entries = await queryNutritionForDate(userId, date);
    
    const totalCalories = entries.reduce((sum, entry) => sum + (entry.analysis?.totalCalories || 0), 0);
    return NextResponse.json({
      success: true,
      date,
      totalCalories,
      entries,
      userId,
    });
  } catch (error) {
    console.error('Error fetching nutrition history:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 400 }
    );
  }
} 