'use client';

import { useState, useEffect } from 'react';
import DatePicker from './DatePicker';

interface WeightTrackerProps {
  onSubmit: (weightData: {
    date: Date;
    weight: number;
    bodyFat?: number;
    bmi?: number;
    notes?: string;
    measurements?: {
      waist?: number;
      chest?: number;
      arms?: number;
      thighs?: number;
      hips?: number;
    };
  }) => void;
  initialData?: {
    date?: Date;
    weight?: number;
    bodyFat?: number;
    notes?: string;
    measurements?: {
      waist?: number;
      chest?: number;
      arms?: number;
      thighs?: number;
      hips?: number;
    };
  };
  userHeight?: number; // in cm, for BMI calculation
  isOpen: boolean;
  onClose: () => void;
}

export default function WeightTracker({
  onSubmit,
  initialData,
  userHeight,
  isOpen,
  onClose
}: WeightTrackerProps) {
  // State for form data
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [weight, setWeight] = useState<number>(initialData?.weight || 0);
  const [bodyFat, setBodyFat] = useState<number | undefined>(initialData?.bodyFat);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  // State for body measurements
  const [waist, setWaist] = useState<number | undefined>(initialData?.measurements?.waist);
  const [chest, setChest] = useState<number | undefined>(initialData?.measurements?.chest);
  const [arms, setArms] = useState<number | undefined>(initialData?.measurements?.arms);
  const [thighs, setThighs] = useState<number | undefined>(initialData?.measurements?.thighs);
  const [hips, setHips] = useState<number | undefined>(initialData?.measurements?.hips);
  
  // Calculate BMI if height is available
  const [bmi, setBmi] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (userHeight && weight) {
      const heightInMeters = userHeight / 100;
      const calculatedBmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
      setBmi(calculatedBmi);
    } else {
      setBmi(undefined);
    }
  }, [weight, userHeight]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (weight <= 0) {
      alert('Please enter a valid weight');
      return;
    }
    
    // Collect measurements if any are provided
    const measurements: Record<string, number> = {};
    if (waist) measurements.waist = waist;
    if (chest) measurements.chest = chest;
    if (arms) measurements.arms = arms;
    if (thighs) measurements.thighs = thighs;
    if (hips) measurements.hips = hips;
    
    onSubmit({
      date,
      weight,
      bodyFat,
      bmi,
      notes,
      measurements: Object.keys(measurements).length > 0 ? measurements : undefined
    });
  };

  const getBmiCategory = (bmiValue: number): { label: string; color: string } => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: '#3b82f6' }; // blue
    if (bmiValue < 25) return { label: 'Normal weight', color: '#10b981' }; // green
    if (bmiValue < 30) return { label: 'Overweight', color: '#f59e0b' }; // yellow
    return { label: 'Obese', color: '#ef4444' }; // red
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Track Weight</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <DatePicker
            selectedDate={date}
            onChange={setDate}
            label="Date"
            maxDate={new Date()}
          />
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              placeholder="Enter weight in kg"
              step="0.1"
              min="0"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          
          {bmi !== undefined && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                BMI (Body Mass Index)
              </label>
              <div className="flex items-center">
                <div className="text-lg font-semibold mr-2" style={{ color: getBmiCategory(bmi).color }}>
                  {bmi}
                </div>
                <div className="text-sm" style={{ color: getBmiCategory(bmi).color }}>
                  {getBmiCategory(bmi).label}
                </div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (bmi / 40) * 100)}%`,
                    backgroundColor: getBmiCategory(bmi).color
                  }}
                ></div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Body Fat % (optional)
            </label>
            <input
              type="number"
              value={bodyFat || ''}
              onChange={(e) => setBodyFat(parseFloat(e.target.value) || undefined)}
              placeholder="Enter body fat percentage"
              step="0.1"
              min="0"
              max="100"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
            >
              {showAdvanced ? '- Hide' : '+ Show'} Additional Measurements
            </button>
          </div>
          
          {showAdvanced && (
            <div className="border border-gray-200 rounded-md p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    value={waist || ''}
                    onChange={(e) => setWaist(parseFloat(e.target.value) || undefined)}
                    placeholder="Waist"
                    step="0.1"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    value={chest || ''}
                    onChange={(e) => setChest(parseFloat(e.target.value) || undefined)}
                    placeholder="Chest"
                    step="0.1"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Arms (cm)
                  </label>
                  <input
                    type="number"
                    value={arms || ''}
                    onChange={(e) => setArms(parseFloat(e.target.value) || undefined)}
                    placeholder="Arms"
                    step="0.1"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Thighs (cm)
                  </label>
                  <input
                    type="number"
                    value={thighs || ''}
                    onChange={(e) => setThighs(parseFloat(e.target.value) || undefined)}
                    placeholder="Thighs"
                    step="0.1"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Hips (cm)
                  </label>
                  <input
                    type="number"
                    value={hips || ''}
                    onChange={(e) => setHips(parseFloat(e.target.value) || undefined)}
                    placeholder="Hips"
                    step="0.1"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this weight measurement"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 h-24"
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Weight Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 