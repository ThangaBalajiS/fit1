'use client';

import { useState, useEffect } from 'react';
import { FaUtensils, FaDumbbell, FaGlassWater, FaUser, FaChartLine, FaClock, FaGear } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import DashboardTrackingSection from '@/components/DashboardTrackingSection';

interface UserDetails {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general_fitness';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  dailyCaloriesRecommended: number;
  waterIntakeRecommended: number;
}

interface TrackingState {
  isOpen: boolean;
  type: 'food' | 'workout' | 'water' | null;
  details: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showManageDetailsModal, setShowManageDetailsModal] = useState(false);
  const [detailsForm, setDetailsForm] = useState<UserDetails>({
    height: 0,
    weight: 0,
    age: 0,
    gender: 'male',
    goal: 'general_fitness',
    activityLevel: 'moderately_active',
    dailyCaloriesRecommended: 0,
    waterIntakeRecommended: 0
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [todaysFoods, setTodaysFoods] = useState<any[]>([]);
  const [todaysCalories, setTodaysCalories] = useState(0);
  const [todaysWater, setTodaysWater] = useState(0);

  useEffect(() => {
    // Check if the auth cookie exists
    const hasCookie = document.cookie.includes('fit1-session=');
    
    if (!hasCookie) {
      // Redirect to login if no auth cookie
      router.replace('/api/auth/signin');
    } else {
      fetchUserDetails();
    }
  }, [router]);

  useEffect(() => {
    const fetchTodaysFood = async () => {
      try {
        const res = await fetch('/api/nutrition/history', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setTodaysFoods(data.entries);
          setTodaysCalories(data.totalCalories);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchTodaysFood();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch('/api/user/details', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/api/auth/signin');
          return;
        }
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      if (data.userDetails && Object.keys(data.userDetails).length > 0) {
        setUserDetails(data.userDetails);
        setDetailsForm(data.userDetails);
      } else {
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetailsForm(prev => ({
      ...prev,
      [name]: name === 'height' || name === 'weight' || name === 'age' 
        ? Number(value) 
        : value
    }));
  };

  const handleUserDetailsSubmit = async () => {
    try {
      const response = await fetch('/api/user/details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(detailsForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update user details');
      }

      const data = await response.json();
      setUserDetails(data.userDetails);
      setShowDetailsModal(false);
      setShowManageDetailsModal(false);
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const openManageDetails = () => {
    if (userDetails) {
      setDetailsForm(userDetails);
    }
    setShowManageDetailsModal(true);
  };

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

  // Set values from userDetails if available
  const calories = todaysCalories;
  const calorieGoal = userDetails?.dailyCaloriesRecommended || 2000;
  const waterIntake = 0; // TODO: Replace with actual tracked water intake for the day
  const waterGoalMl = userDetails?.waterIntakeRecommended || 2000;
  const weight = userDetails?.weight || 0;
  const workoutsDone = 2; // TODO: Replace with actual tracked workouts for the day
  const workoutGoal = 3; // TODO: Replace with actual workout goal

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
        const response = await fetch('/api/nutrition/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies with the request
          body: JSON.stringify({
            food: trackingState.details,
            time: formatDateTime(selectedTime)
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if unauthorized
            router.replace('/api/auth/signin');
            return;
          }
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

  // Refresh today's food
  const refreshTodaysFood = async () => {
    try {
      const res = await fetch('/api/nutrition/history', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setTodaysFoods(data.entries);
        setTodaysCalories(data.totalCalories);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchTodaysWater = async () => {
    try {
      const res = await fetch('/api/water/history', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setTodaysWater(data.totalIntake);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchTodaysWater();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`bg-gray-800 dark:bg-gray-900 text-white ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            {!isSidebarCollapsed && <h2 className="text-xl font-bold">FIT1</h2>}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-400 hover:text-white rounded-full p-1"
            >
              {isSidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          <div className="flex-1 mt-6">
            <ul className="space-y-2">
              <li>
                <a href="#" className={`flex items-center p-3 ${!isSidebarCollapsed ? 'px-4' : 'justify-center'} text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800`}>
                  <FaChartLine className="w-5 h-5" />
                  {!isSidebarCollapsed && <span className="ml-3">Dashboard</span>}
                </a>
              </li>
              <li>
                <a href="#" className={`flex items-center p-3 ${!isSidebarCollapsed ? 'px-4' : 'justify-center'} text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800`}>
                  <FaClock className="w-5 h-5" />
                  {!isSidebarCollapsed && <span className="ml-3">History</span>}
                </a>
              </li>
              <li>
                <button 
                  onClick={openManageDetails}
                  className={`w-full flex items-center p-3 ${!isSidebarCollapsed ? 'px-4' : 'justify-center'} text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800`}
                >
                  <FaUser className="w-5 h-5" />
                  {!isSidebarCollapsed && <span className="ml-3">My Profile</span>}
                </button>
              </li>
              <li>
                <a href="#" className={`flex items-center p-3 ${!isSidebarCollapsed ? 'px-4' : 'justify-center'} text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800`}>
                  <FaGear className="w-5 h-5" />
                  {!isSidebarCollapsed && <span className="ml-3">Settings</span>}
                </a>
              </li>
            </ul>
          </div>
          <div className="p-4">
            <button
              onClick={async () => {
                const res = await fetch('/api/auth/signout', { method: 'GET', credentials: 'include' });
                const data = await res.json();
                if (res.ok) {
                  router.replace(data.redirectUrl);
                }
                // router.replace('/api/auth/signin');
              }}
              className={`text-red-400 hover:text-red-300 ${!isSidebarCollapsed ? 'w-full text-left' : 'flex justify-center w-full'}`}
            >
              {isSidebarCollapsed ? '←' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Fitness Dashboard</h1>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Calories Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-green-500">{calories}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">of {calorieGoal} kcal</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${(calories / calorieGoal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Workouts Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-blue-500">{workoutsDone}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">of {workoutGoal} workouts</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${(workoutsDone / workoutGoal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Water Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-cyan-500">{todaysWater} mL</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">of {waterGoalMl} mL</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-2.5 rounded-full" 
                    style={{ width: `${(todaysWater / waterGoalMl) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* New Tracking Section */}
          <DashboardTrackingSection userHeight={userDetails?.height} onFoodEntry={refreshTodaysFood} onWaterEntry={fetchTodaysWater} />

          {/* Food list at the bottom, not in the tracker or card */}
          {todaysFoods.length > 0 && (
            <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Today's Food Entries:</div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {todaysFoods.map((entry, idx) => (
                  <li key={entry._id || idx} className="py-2 text-sm text-gray-800 dark:text-gray-100">
                    <span className="font-medium">{entry.foodIntake.food}</span>
                    {entry.analysis?.totalCalories ? (
                      <span className="ml-2 text-gray-500 dark:text-gray-300">({entry.analysis.totalCalories} kcal)</span>
                    ) : null}
                    <span className="ml-2 text-gray-400 dark:text-gray-500">{entry.foodIntake.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
              Track {trackingState.type && trackingState.type.charAt(0).toUpperCase() + trackingState.type.slice(1)}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <textarea
              value={trackingState.details}
              onChange={(e) => setTrackingState(prev => ({ ...prev, details: e.target.value }))}
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              placeholder={`Enter your ${trackingState.type} details...`}
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTrackingState({ isOpen: false, type: null, details: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal (for initial setup) */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Complete Your Profile</h2>
            <p className="text-gray-700 mb-4 font-medium dark:text-gray-200">Please provide your details to get personalized fitness recommendations</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={detailsForm.height}
                  onChange={handleUserDetailsChange}
                  min="1"
                  max="300"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={detailsForm.weight}
                  onChange={handleUserDetailsChange}
                  min="1"
                  max="500"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={detailsForm.age}
                  onChange={handleUserDetailsChange}
                  min="1"
                  max="150"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Gender</label>
                <select
                  name="gender"
                  value={detailsForm.gender}
                  onChange={handleUserDetailsChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Fitness Goal</label>
                <select
                  name="goal"
                  value={detailsForm.goal}
                  onChange={handleUserDetailsChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Activity Level</label>
                <select
                  name="activityLevel"
                  value={detailsForm.activityLevel}
                  onChange={handleUserDetailsChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="lightly_active">Lightly active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very active (hard exercise 6-7 days/week)</option>
                  <option value="extremely_active">Extremely active (very hard exercise & physical job)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleUserDetailsSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage User Details Modal */}
      {showManageDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Manage Profile Details</h2>
            <p className="text-gray-700 mb-4 font-medium dark:text-gray-200">Update your fitness profile information</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={detailsForm.height}
                  onChange={handleUserDetailsChange}
                  min="1"
                  max="300"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={detailsForm.weight}
                  onChange={handleUserDetailsChange}
                  min="1"
                  max="500"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={detailsForm.age}
                  onChange={handleUserDetailsChange}
                  min="1"
                  max="150"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Gender</label>
                <select
                  name="gender"
                  value={detailsForm.gender}
                  onChange={handleUserDetailsChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Fitness Goal</label>
                <select
                  name="goal"
                  value={detailsForm.goal}
                  onChange={handleUserDetailsChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Activity Level</label>
                <select
                  name="activityLevel"
                  value={detailsForm.activityLevel}
                  onChange={handleUserDetailsChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="lightly_active">Lightly active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very active (hard exercise 6-7 days/week)</option>
                  <option value="extremely_active">Extremely active (very hard exercise & physical job)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowManageDetailsModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium dark:text-gray-300 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUserDetailsSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 