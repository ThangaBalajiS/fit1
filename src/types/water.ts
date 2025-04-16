export interface WaterIntake {
  amount: number; // Amount in milliliters
  type: 'water' | 'sparkling_water' | 'flavored_water';
  time: string;
}

export interface WaterAnalysis {
  totalIntake: number; // Total daily intake in milliliters
  goal: number; // Daily goal in milliliters
  completionRate: number; // Percentage of goal completed
  intakePattern: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  recommendations: string[];
  hydrationStatus: 'optimal' | 'adequate' | 'insufficient';
} 