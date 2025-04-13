import { FoodIntake, NutritionAnalysis } from '@/types/nutrition';

interface StoredNutritionData {
  foodIntake: FoodIntake;
  analysis: NutritionAnalysis;
  timestamp: string;
}

// In-memory storage for development
const nutritionStore: StoredNutritionData[] = [];

export async function storeNutritionData(foodIntake: FoodIntake, analysis: NutritionAnalysis) {
  const document = {
    foodIntake,
    analysis,
    timestamp: new Date().toISOString(),
  };

  nutritionStore.push(document);
  return document;
}

export async function queryNutritionHistory(time: string) {
  return nutritionStore
    .filter(entry => entry.foodIntake.time <= time)
    .sort((a, b) => b.foodIntake.time.localeCompare(a.foodIntake.time))
    .slice(0, 7);
} 