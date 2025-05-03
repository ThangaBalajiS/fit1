import mongoose from 'mongoose';
import type { SleepEntry as SleepEntryType, SleepAnalysis as SleepAnalysisType } from '@/types/sleep';

// Schema for tags
const TagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#3498db' }
});

// Schema for sleep entry
const SleepEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  quality: { type: Number, required: true, min: 1, max: 10 },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Schema for sleep analysis
const SleepAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  averageDuration: { type: Number, required: true }, // in minutes
  averageQuality: { type: Number, required: true },
  sleepDebt: { type: Number, required: true }, // in minutes
  sleepEfficiency: { type: Number, required: true }, // percentage
  cycles: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create compound indexes for efficient querying
SleepEntrySchema.index({ userId: 1, startTime: -1 });
SleepAnalysisSchema.index({ userId: 1, date: -1 });

// Create the models
export const SleepEntry = mongoose.models.SleepEntry || 
  mongoose.model('SleepEntry', SleepEntrySchema);

export const SleepAnalysis = mongoose.models.SleepAnalysis || 
  mongoose.model('SleepAnalysis', SleepAnalysisSchema);

// Helper functions for sleep data calculations
export const calculateSleepDuration = (startTime: Date, endTime: Date): number => {
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
};

export const estimateSleepCycles = (durationMinutes: number): number => {
  // Average sleep cycle is about 90 minutes
  return Math.floor(durationMinutes / 90);
};

export const calculateSleepEfficiency = (
  durationMinutes: number, 
  timeInBedMinutes: number
): number => {
  return Math.round((durationMinutes / timeInBedMinutes) * 100);
}; 