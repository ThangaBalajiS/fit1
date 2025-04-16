'use client';

import { useState } from 'react';
import { FaUtensils, FaDumbbell, FaGlassWater } from 'react-icons/fa6';

interface TrackingState {
  isOpen: boolean;
  type: 'food' | 'workout' | 'water' | null;
  details: string;
}

export default function Dashboard() {
  const [trackingState, setTrackingState] = useState<TrackingState>({
    isOpen: false,
    type: null,
    details: '',
  });

  // Get current time in HH:mm format
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [selectedTime, setSelectedTime] = useState(getCurrentTime());

  const formatDateTime = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const date = new Date(now.setHours(parseInt(hours), parseInt(minutes)));
    
    return `${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}, ${date.getDate()}-${date.toLocaleString('default', { month: 'long' })}-${date.getFullYear()}`;
  };

  const calories = 1200; // This would come from your state management
  const calorieGoal = 2000;
  const workoutsDone = 2;
  const workoutGoal = 3;
  const waterIntake = 6;
  const waterGoal = 8;

  const handleTrackingClick = (type: 'food' | 'workout' | 'water') => {
    setSelectedTime(getCurrentTime());
    setTrackingState({
      isOpen: true,
      type,
      details: '',
    });
  };

  const handleSubmit = async () => {
    if (trackingState.type === 'food') {
      try {
        const response = await fetch('http://localhost:3000/api/nutrition/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            credentials: 'include'
          },
          body: JSON.stringify({
            food: trackingState.details,
            time: formatDateTime(selectedTime)
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit nutrition data');
        }

        const data = await response.json();
        console.log('Success:', data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    setTrackingState({ isOpen: false, type: null, details: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Fitness Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Calories Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-green-500">{calories}</div>
              <div className="text-sm text-gray-500">of {calorieGoal} kcal</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${(calories / calorieGoal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Workouts Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-blue-500">{workoutsDone}</div>
              <div className="text-sm text-gray-500">of {workoutGoal} workouts</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${(workoutsDone / workoutGoal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Water Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-cyan-500">{waterIntake}</div>
              <div className="text-sm text-gray-500">of {waterGoal} glasses</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className="bg-cyan-500 h-2.5 rounded-full" 
                  style={{ width: `${(waterIntake / waterGoal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTrackingClick('food')}
            className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaUtensils /> Track Food
          </button>
          <button
            onClick={() => handleTrackingClick('workout')}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaDumbbell /> Track Workout
          </button>
          <button
            onClick={() => handleTrackingClick('water')}
            className="flex items-center justify-center gap-2 bg-cyan-500 text-white py-3 px-6 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <FaGlassWater /> Track Water
          </button>
        </div>

        {/* Tracking Modal */}
        {trackingState.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                Track {trackingState.type && trackingState.type.charAt(0).toUpperCase() + trackingState.type.slice(1)}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <textarea
                value={trackingState.details}
                onChange={(e) => setTrackingState(prev => ({ ...prev, details: e.target.value }))}
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                placeholder={`Enter your ${trackingState.type} details...`}
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setTrackingState({ isOpen: false, type: null, details: '' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 