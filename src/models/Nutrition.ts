import mongoose from 'mongoose';
import { FoodIntake, NutritionAnalysis } from '@/types/nutrition';

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  foods: [{ type: String, required: true }],
  time: { type: String, required: true },
});

const MacroSchema = new mongoose.Schema({
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  fiber: { type: Number, required: true },
});

const MealAnalysisSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  macros: {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
  },
});

const NutritionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  foodIntake: {
    food: { type: String, required: true },
    time: { type: String, required: true },
  },
  analysis: {
    totalCalories: { type: Number, required: true },
    macros: MacroSchema,
    meal: MealAnalysisSchema,
    foods: [MealAnalysisSchema],
    recommendations: [{ type: String }],
  },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Create compound index for userId and date for efficient querying
// NutritionSchema.index({ userId: 1, 'foodIntake.time': 1 });

export const Nutrition = mongoose.models.Nutrition || mongoose.model('Nutrition', NutritionSchema); 