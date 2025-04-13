export interface FitnessData {
  date: string;
  weight: number;
  calories: number;
  steps: number;
  workoutDuration: number;
  workoutType: string;
  sleepHours: number;
  waterIntake: number;
  mood: 'great' | 'good' | 'neutral' | 'bad';
}

export interface AIAnalysis {
  recommendations: string[];
  insights: string[];
  trends: {
    category: string;
    trend: 'up' | 'down' | 'stable';
    analysis: string;
  }[];
} 