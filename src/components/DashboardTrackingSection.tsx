'use client';

import { useState, useRef, useEffect } from 'react';
import { FaUtensils, FaWeightScale, FaBed, FaGlassWater } from 'react-icons/fa6';
import SleepTracker from './SleepTracker';
import WeightTracker from './WeightTracker';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FoodTrackingState {
  isOpen: boolean;
  details: string;
  selectedTime: string;
  selectedDate: string; // ISO date string
}

interface WaterTrackingState {
  isOpen: boolean;
  amount: string;
  selectedTime: string;
  selectedDate: string;
}

interface AIFeedbackState {
  isOpen: boolean;
  message: string;
  title: string;
}

interface TrackingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  bgColor: string;
  textColor: string;
}

// Card component for each tracking option
const TrackingCard = ({ 
  icon, 
  title, 
  description, 
  onClick, 
  bgColor, 
  textColor 
}: TrackingCardProps) => (
  <div 
    className={`${bgColor} ${textColor} rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all`}
    onClick={onClick}
  >
    <div className="flex items-center mb-3">
      <div className="text-xl mr-2">{icon}</div>
      <h3 className="font-bold">{title}</h3>
    </div>
    <p className="text-sm opacity-90">{description}</p>
  </div>
);

// Get current time in HH:mm format
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

// Format date time for submission
const formatDateTime = (time: string) => {
  const now = new Date();
  const [hours, minutes] = time.split(':');
  const date = new Date(now.setHours(parseInt(hours), parseInt(minutes)));
  
  return `${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}, ${date.getDate()}-${date.toLocaleString('default', { month: 'long' })}-${date.getFullYear()}`;
};

export default function DashboardTrackingSection({ userDetails, onFoodEntry, onWaterEntry }: { 
  userDetails?: any, 
  onFoodEntry?: () => void, 
  onWaterEntry?: () => void 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State for food tracking
  const [foodTracking, setFoodTracking] = useState<FoodTrackingState>({
    isOpen: false,
    details: '',
    selectedTime: getCurrentTime(),
    selectedDate: getCurrentDate(),
  });
  
  // State for other tracking modals
  const [showSleepTracker, setShowSleepTracker] = useState(false);
  const [showWeightTracker, setShowWeightTracker] = useState(false);
  
  // State for water tracking
  const [waterTracking, setWaterTracking] = useState<WaterTrackingState>({
    isOpen: false,
    amount: '',
    selectedTime: getCurrentTime(),
    selectedDate: getCurrentDate(),
  });

  // State for AI feedback modal
  const [aiFeedback, setAIFeedback] = useState<AIFeedbackState>({
    isOpen: false,
    message: '',
    title: '',
  });
  
  // Refs for modal content
  const foodModalRef = useRef<HTMLDivElement>(null);
  const waterModalRef = useRef<HTMLDivElement>(null);
  const aiModalRef = useRef<HTMLDivElement>(null);
  
  // Close modals when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (foodTracking.isOpen && foodModalRef.current && !foodModalRef.current.contains(event.target as Node)) {
        setFoodTracking(prev => ({ ...prev, isOpen: false }));
      }
      
      if (waterTracking.isOpen && waterModalRef.current && !waterModalRef.current.contains(event.target as Node)) {
        setWaterTracking(prev => ({ ...prev, isOpen: false }));
      }
      
      if (aiFeedback.isOpen && aiModalRef.current && !aiModalRef.current.contains(event.target as Node)) {
        setAIFeedback(prev => ({ ...prev, isOpen: false }));
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [foodTracking.isOpen, waterTracking.isOpen, aiFeedback.isOpen]);
  
  // Handle food tracking
  const handleFoodTrackingClick = () => {
    setFoodTracking({
      isOpen: true,
      details: '',
      selectedTime: getCurrentTime(),
      selectedDate: getCurrentDate(),
    });
  };

  const handleFoodSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading('Analyzing food entry...');
    try {
      const response = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          food: foodTracking.details,
          time: formatDateTime(foodTracking.selectedTime),
          date: foodTracking.selectedDate,
          userDetails: userDetails // Include user details for AI context
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/api/auth/signin');
          toast.dismiss(toastId);
          return;
        }
        throw new Error('Failed to submit nutrition data');
      }

      const data = await response.json();
      toast.success('Food entry saved!', { id: toastId });
      
      // Show AI feedback in modal if available
      if (data.aiFeedback) {
        setAIFeedback({
          isOpen: true,
          title: 'Nutrition Insight',
          message: data.aiFeedback
        });
      }
      
      if (onFoodEntry) onFoodEntry();
    } catch (error) {
      toast.error('Error saving food entry', { id: toastId });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
    setFoodTracking({
      ...foodTracking,
      isOpen: false
    });
  };
  
  // Handle sleep tracking submission
  const handleSleepSubmit = (data: any) => {
    console.log('Sleep data submitted:', data);
    // TODO: Implement submission to API
    setShowSleepTracker(false);
  };
  
  // Handle weight tracking submission
  const handleWeightSubmit = async (data: any) => {
    setLoading(true);
    const toastId = toast.loading('Saving weight data...');
    try {
      const response = await fetch('/api/weight/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          weight: data.weight,
          date: data.date.toISOString().split('T')[0],
          userDetails: userDetails
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/api/auth/signin');
          toast.dismiss(toastId);
          return;
        }
        throw new Error('Failed to submit weight data');
      }
      
      const responseData = await response.json();
      toast.success('Weight entry saved!', { id: toastId });
      
      // Show AI feedback in modal if available
      if (responseData.aiFeedback) {
        setAIFeedback({
          isOpen: true,
          title: 'Weight Insight',
          message: responseData.aiFeedback
        });
      }
    } catch (error) {
      toast.error('Error saving weight data', { id: toastId });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
    setShowWeightTracker(false);
  };

  const handleWaterTrackingClick = () => {
    setWaterTracking({
      isOpen: true,
      amount: '',
      selectedTime: getCurrentTime(),
      selectedDate: getCurrentDate(),
    });
  };

  const handleWaterSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading('Logging water intake...');
    try {
      const response = await fetch('/api/water/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: Number(waterTracking.amount),
          time: waterTracking.selectedTime,
          date: waterTracking.selectedDate,
          userDetails: userDetails // Include user details for AI context
        }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.dismiss(toastId);
          router.replace('/api/auth/signin');
          return;
        }
        throw new Error('Failed to submit water data');
      }
      
      const data = await response.json();
      toast.success('Water entry saved!', { id: toastId });
      
      // Show AI feedback in modal if available
      if (data.aiFeedback) {
        setAIFeedback({
          isOpen: true,
          title: 'Hydration Insight',
          message: data.aiFeedback
        });
      }
      
      if (onWaterEntry) onWaterEntry();
    } catch (error) {
      toast.error('Error saving water entry', { id: toastId });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
    setWaterTracking({
      ...waterTracking,
      isOpen: false
    });
  };
  
  return (
    <div className="my-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Track Your Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TrackingCard
          icon={<FaUtensils />}
          title="Track Food"
          description="Log your meals and track nutrition to reach your goals."
          onClick={handleFoodTrackingClick}
          bgColor="bg-green-500"
          textColor="text-white"
        />
        
        <TrackingCard
          icon={<FaWeightScale />}
          title="Track Weight"
          description="Record your weight and body measurements."
          onClick={() => setShowWeightTracker(true)}
          bgColor="bg-blue-500"
          textColor="text-white"
        />
        
        <TrackingCard
          icon={<FaBed />}
          title="Track Sleep"
          description="Monitor your sleep patterns for better recovery."
          onClick={() => setShowSleepTracker(true)}
          bgColor="bg-purple-500"
          textColor="text-white"
        />
        
        <TrackingCard
          icon={<FaGlassWater />}
          title="Track Water"
          description="Log your water intake in mL."
          onClick={handleWaterTrackingClick}
          bgColor="bg-cyan-500"
          textColor="text-white"
        />
      </div>
      
      {/* Food Tracking Modal */}
      {foodTracking.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div ref={foodModalRef} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Track Food
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Date
              </label>
              <input
                type="date"
                value={foodTracking.selectedDate}
                onChange={(e) => setFoodTracking(prev => ({ ...prev, selectedDate: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                max={getCurrentDate()}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Time
              </label>
              <input
                type="time"
                value={foodTracking.selectedTime}
                onChange={(e) => setFoodTracking(prev => ({ ...prev, selectedTime: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Food Details
              </label>
              <textarea
                value={foodTracking.details}
                onChange={(e) => setFoodTracking(prev => ({ ...prev, details: e.target.value }))}
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-gray-900"
                placeholder="Enter what you ate (e.g., '2 eggs, 1 slice of toast, 1 cup of coffee')"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setFoodTracking(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleFoodSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                disabled={loading}
              >
                Save Food Entry
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sleep Tracker Modal */}
      <SleepTracker
        isOpen={showSleepTracker}
        onClose={() => setShowSleepTracker(false)}
        onSubmit={handleSleepSubmit}
      />
      
      {/* Weight Tracker Modal */}
      <WeightTracker
        isOpen={showWeightTracker}
        onClose={() => setShowWeightTracker(false)}
        onSubmit={handleWeightSubmit}
        userHeight={userDetails?.height}
        userWeight={userDetails?.weight}
      />
      
      {/* Water Tracking Modal */}
      {waterTracking.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div ref={waterModalRef} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Track Water</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Date</label>
              <input
                type="date"
                value={waterTracking.selectedDate}
                onChange={(e) => setWaterTracking(prev => ({ ...prev, selectedDate: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-900"
                max={getCurrentDate()}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Time</label>
              <input
                type="time"
                value={waterTracking.selectedTime}
                onChange={(e) => setWaterTracking(prev => ({ ...prev, selectedTime: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-900"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Amount (mL)</label>
              <input
                type="number"
                value={waterTracking.amount}
                onChange={(e) => setWaterTracking(prev => ({ ...prev, amount: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-900"
                placeholder="Enter amount in mL"
                min={0}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setWaterTracking(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleWaterSubmit}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium"
                disabled={loading}
              >
                Save Water Entry
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Feedback Modal */}
      {aiFeedback.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div ref={aiModalRef} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{aiFeedback.title}</h2>
              <button 
                onClick={() => setAIFeedback(prev => ({ ...prev, isOpen: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <p className="text-gray-700">{aiFeedback.message}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setAIFeedback(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 