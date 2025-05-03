import mongoose from 'mongoose';
import { WaterIntake, WaterAnalysis } from '@/types/water';

const IntakePatternSchema = new mongoose.Schema({
  morning: { type: Number, required: true },
  afternoon: { type: Number, required: true },
  evening: { type: Number, required: true },
});

const WaterSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  intake: {
    amount: { type: Number, required: true },
    time: { type: String, required: true },
  },
  analysis: {
    totalIntake: { type: Number, required: true },
    goal: { type: Number, required: true },
    completionRate: { type: Number, required: true },
    intakePattern: IntakePatternSchema,
    hydrationStatus: { 
      type: String, 
      enum: ['optimal', 'adequate', 'insufficient'], 
      required: true 
    },
  },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Create compound index for userId and date for efficient querying
WaterSchema.index({ userId: 1, timestamp: 1 });

export const Water = mongoose.models.Water || mongoose.model('Water', WaterSchema); 