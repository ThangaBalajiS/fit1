import { FoodIntake, NutritionAnalysis } from '@/types/nutrition';
import { Nutrition } from '@/models/Nutrition';
import { connectDB } from '@/lib/db';
import { WaterIntake, WaterAnalysis } from '@/types/water';
import { Water } from '@/models/Water';

export async function storeNutritionData(
  userId: string,
  foodIntake: FoodIntake,
  analysis: NutritionAnalysis
) {
  await connectDB();
  const nutritionData = new Nutrition({
    userId,
    foodIntake,
    analysis,
  });

  await nutritionData.save();
  return nutritionData;
}

export async function queryNutritionHistory(userId: string, date: string) {
  await connectDB();
  return await Nutrition.find({
    userId,
    'foodIntake.date': { $lte: date }
  })
    .sort({ 'foodIntake.date': -1 })
    .limit(7)
    .lean();
}

export async function getUserNutritionStats(userId: string) {
  await connectDB();
  const stats = await Nutrition.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        averageCalories: { $avg: '$analysis.totalCalories' },
        totalEntries: { $sum: 1 },
        avgProtein: { $avg: '$analysis.macros.protein' },
        avgCarbs: { $avg: '$analysis.macros.carbs' },
        avgFats: { $avg: '$analysis.macros.fats' }
      }
    }
  ]);

  return stats[0] || null;
}

export async function queryNutritionForDate(userId: string, date: string) {
  await connectDB();
  return await Nutrition.find({
    userId,
    'foodIntake.date': date
  })
    .sort({ 'foodIntake.time': 1 })
    .lean();
}

export async function storeWaterData(
  userId: string,
  waterIntake: WaterIntake,
  analysis: WaterAnalysis
) {
  await connectDB();
  const waterData = new Water({
    userId,
    intake: waterIntake,
    analysis,
  });
  await waterData.save();
  return waterData;
}

export async function queryWaterForDate(userId: string, date: string) {
  await connectDB();
  const entries = await Water.find({
    userId,
    timestamp: {
      $gte: new Date(date + 'T00:00:00.000Z'),
      $lte: new Date(date + 'T23:59:59.999Z'),
    },
  }).sort({ timestamp: 1 }).lean();
  const totalIntake = entries.reduce((sum, entry) => sum + (entry.intake?.amount || 0), 0);
  return { entries, totalIntake };
} 