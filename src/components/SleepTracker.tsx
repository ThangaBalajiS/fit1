'use client';

import { useState } from 'react';
import DatePicker from './DatePicker';
import { format, differenceInMinutes } from 'date-fns';

interface SleepTrackerProps {
  onSubmit: (sleepData: {
    startTime: Date;
    endTime: Date;
    duration: number;
    quality: number;
    notes: string;
    tags: string[];
  }) => void;
  initialData?: {
    startTime?: Date;
    endTime?: Date;
    quality?: number;
    notes?: string;
    tags?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function SleepTracker({
  onSubmit,
  initialData,
  isOpen,
  onClose
}: SleepTrackerProps) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // State for form data
  const [startTime, setStartTime] = useState<Date>(
    initialData?.startTime || 
    new Date(yesterday.setHours(22, 0, 0, 0))
  );
  
  const [endTime, setEndTime] = useState<Date>(
    initialData?.endTime || 
    new Date(today.setHours(7, 0, 0, 0))
  );
  
  const [quality, setQuality] = useState<number>(initialData?.quality || 7);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  
  const defaultTags = ['deep sleep', 'restless', 'interrupted', 'nap', 'good sleep', 'bad sleep'];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);

  // Calculate sleep duration whenever start or end time changes
  const duration = differenceInMinutes(endTime, startTime);
  const formattedDuration = `${Math.floor(duration / 60)}h ${duration % 60}m`;

  // Handle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (startTime >= endTime) {
      alert('Sleep end time must be after start time');
      return;
    }
    
    if (duration <= 0) {
      alert('Sleep duration must be positive');
      return;
    }
    
    onSubmit({
      startTime,
      endTime,
      duration,
      quality,
      notes,
      tags: selectedTags
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Track Sleep</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              selectedDate={startTime}
              onChange={setStartTime}
              label="Sleep Start"
              showTime={true}
            />
            
            <DatePicker
              selectedDate={endTime}
              onChange={setEndTime}
              label="Sleep End"
              showTime={true}
            />
          </div>
          
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Sleep Duration
              </label>
              <span className="text-sm text-blue-600 font-medium">
                {formattedDuration}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full"
                style={{ 
                  width: `${Math.min(100, (duration / (8 * 60)) * 100)}%`,
                  backgroundColor: duration < 6 * 60 ? '#f87171' : duration > 9 * 60 ? '#10b981' : '#3b82f6'
                }}
              ></div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Sleep Quality (1-10)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="10"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-2 text-sm font-medium" style={{
                color: quality < 4 ? '#f87171' : quality > 7 ? '#10b981' : '#3b82f6'
              }}>
                {quality}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag) 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you sleep? Any factors that affected your sleep?"
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
              Save Sleep Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 