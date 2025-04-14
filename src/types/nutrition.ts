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
  meal: {
    name: string; // meal of the day
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  foods: {
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