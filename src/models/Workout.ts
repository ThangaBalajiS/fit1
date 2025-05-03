import mongoose from 'mongoose';
import { Exercise, WorkoutSession, WorkoutAnalysis } from '@/types/workout';

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: Number,
  duration: Number,
  distance: Number,
});

const TrendSchema = new mongoose.Schema({
  category: { type: String, required: true },
  trend: { type: String, enum: ['improving', 'declining', 'stable'], required: true },
  analysis: { type: String, required: true },
});

const WorkoutSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  session: {
    type: { type: String, enum: ['strength', 'cardio', 'flexibility', 'mixed'], required: true },
    exercises: [ExerciseSchema],
    duration: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    intensity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    notes: String,
  },
  analysis: {
    totalCaloriesBurned: { type: Number, required: true },
    workoutEfficiency: { type: Number, required: true },
    primaryMuscleGroups: [String],
    trends: [TrendSchema],
  },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Create compound index for userId and date for efficient querying
WorkoutSchema.index({ userId: 1, timestamp: 1 });

export const Workout = mongoose.models.Workout || mongoose.model('Workout', WorkoutSchema); 