import mongoose from 'mongoose';
import type { WeightEntry as WeightEntryType, WeightAnalysis as WeightAnalysisType } from '@/types/weight';

// Schema for body measurements
const MeasurementsSchema = new mongoose.Schema({
  waist: { type: Number },
  chest: { type: Number },
  arms: { type: Number },
  thighs: { type: Number },
  hips: { type: Number }
}, { _id: false });

// Schema for weight entry
const WeightEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true }, // in kg
  bodyFat: { type: Number }, // percentage
  bmi: { type: Number },
  notes: { type: String },
  measurements: MeasurementsSchema,
  createdAt: { type: Date, default: Date.now }
});

// Schema for weight analysis
const WeightAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  averageWeight: { type: Number, required: true },
  weightChange: { type: Number, required: true },
  weightChangePct: { type: Number, required: true },
  bmiChange: { type: Number },
  bodyFatChange: { type: Number },
  trendDirection: { 
    type: String, 
    required: true, 
    enum: ['up', 'down', 'stable'] 
  },
  createdAt: { type: Date, default: Date.now }
});

// Create compound indexes for efficient querying
WeightEntrySchema.index({ userId: 1, date: -1 });
WeightAnalysisSchema.index({ userId: 1, date: -1 });

// Create the models
export const WeightEntry = mongoose.models.WeightEntry || 
  mongoose.model('WeightEntry', WeightEntrySchema);

export const WeightAnalysis = mongoose.models.WeightAnalysis || 
  mongoose.model('WeightAnalysis', WeightAnalysisSchema);

// Helper functions for weight data calculations
export const calculateBMI = (weight: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(2));
};

export const calculateWeightChange = (
  currentWeight: number, 
  previousWeight: number
): { change: number, changePct: number } => {
  const change = parseFloat((currentWeight - previousWeight).toFixed(2));
  const changePct = parseFloat(((change / previousWeight) * 100).toFixed(2));
  return { change, changePct };
};

export const determineWeightTrend = (
  currentWeight: number, 
  previousWeight: number, 
  threshold = 0.5
): 'up' | 'down' | 'stable' => {
  const change = currentWeight - previousWeight;
  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'up' : 'down';
}; 