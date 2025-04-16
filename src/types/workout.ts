export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number; // Optional for bodyweight exercises
  duration?: number; // Optional for cardio/duration-based exercises
  distance?: number; // Optional for cardio exercises
}

export interface WorkoutSession {
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  exercises: Exercise[];
  duration: number; // Total workout duration in minutes
  caloriesBurned: number;
  intensity: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface WorkoutAnalysis {
  totalCaloriesBurned: number;
  workoutEfficiency: number; // 0-100 score
  primaryMuscleGroups: string[];
  recommendations: string[];
  trends: {
    category: string;
    trend: 'improving' | 'declining' | 'stable';
    analysis: string;
  }[];
} 