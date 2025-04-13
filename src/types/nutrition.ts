export interface FoodIntake {
  food: string;
  time: string;
}

export interface NutritionAnalysis {
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  meals: {
    name: string;
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  }[];
  recommendations: string[];
} 