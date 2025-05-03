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
  totalDuration: number;
  caloriesBurned: number;
  averageHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  zones: {
    warmup: number;
    fatburn: number;
    cardio: number;
    peak: number;
  };
} 