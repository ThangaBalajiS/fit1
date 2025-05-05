'use client';

import { useState, useRef, useEffect } from 'react';
import DatePicker from './DatePicker';
import { FaMinus, FaPlus } from 'react-icons/fa6';

interface WeightTrackerProps {
  onSubmit: (weightData: {
    date: Date;
    weight: number;
  }) => void;
  initialData?: {
    date?: Date;
    weight?: number;
  };
  userHeight?: number; // in cm, for BMI calculation
  userWeight?: number; // in kg, for default value
  isOpen: boolean;
  onClose: () => void;
}

export default function WeightTracker({
  onSubmit,
  initialData,
  userHeight,
  userWeight,
  isOpen,
  onClose
}: WeightTrackerProps) {
  // State for form data
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [weight, setWeight] = useState<number>(userWeight || initialData?.weight || 70);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Update weight state when userWeight changes
  useEffect(() => {
    if (userWeight && isOpen) {
      setWeight(userWeight);
    }
  }, [userWeight, isOpen]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (weight <= 0) {
      alert('Please enter a valid weight');
      return;
    }
    
    onSubmit({
      date,
      weight
    });
  };

  // Handle weight increment/decrement
  const adjustWeight = (amount: number) => {
    // Round to 2 decimal places to avoid floating point issues
    setWeight(Math.max(0, parseFloat((weight + amount).toFixed(2))));
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Track Weight</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <DatePicker
            selectedDate={date}
            onChange={setDate}
            label="Date"
            maxDate={new Date()}
          />
          
          <div className="flex flex-col items-center">
            <label className="block text-lg font-semibold text-gray-800 mb-4 self-start">
              Weight (kg)
            </label>
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => adjustWeight(-0.05)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full flex items-center justify-center w-14 h-14 text-2xl"
              >
                <FaMinus />
              </button>
              
              <div className="text-4xl font-bold text-blue-600">
                {weight.toFixed(2)}
              </div>
              
              <button
                type="button"
                onClick={() => adjustWeight(0.05)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full flex items-center justify-center w-14 h-14 text-2xl"
              >
                <FaPlus />
              </button>
            </div>

            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              className="mt-6 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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