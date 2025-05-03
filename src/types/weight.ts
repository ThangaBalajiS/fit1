export interface WeightEntry {
  date: string;     // ISO timestamp for the weight measurement
  weight: number;   // Weight in kg
  bodyFat?: number; // Body fat percentage (optional)
  bmi?: number;     // Body Mass Index (optional)
  notes?: string;   // Any additional notes
  measurements?: {  // Optional body measurements
    waist?: number;
    chest?: number;
    arms?: number;
    thighs?: number;
    hips?: number;
  };
}

export interface WeightAnalysis {
  averageWeight: number;     // Average weight over the period
  weightChange: number;      // Change in weight over the period
  weightChangePct: number;   // Percentage change in weight
  bmiChange?: number;        // Change in BMI
  bodyFatChange?: number;    // Change in body fat percentage
  trendDirection: 'up' | 'down' | 'stable'; // Direction of weight trend
  recommendations: string[]; // Recommendations based on weight data
} 