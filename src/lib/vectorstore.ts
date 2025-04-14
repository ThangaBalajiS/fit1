import { FoodIntake, NutritionAnalysis } from '@/types/nutrition';
import { Nutrition } from '@/models/Nutrition';
import { connectDB } from '@/lib/db';

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