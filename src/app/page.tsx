'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

// Define User schema if not already defined
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  workosId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

// Get or create User model
const User = mongoose?.models?.User || mongoose.model('User', UserSchema);

async function getUser(userId: string) {
  await connectDB();
  return User.findById(userId);
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for the session cookie
    const hasCookie = document.cookie.includes('fit1-session=');
    // console.log('hasCookie', hasCookie, document.cookie);
    if (!hasCookie) {
      router.replace('/api/auth/signin');
    }
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          AI Fitness Tracker
        </h1>
        <div className="flex items-center gap-4">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Daily Check-in</h2>
          <p className="text-gray-600">
            Track your daily fitness metrics and get AI-powered insights
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Log Today's Data
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
          <p className="text-gray-600">
            View personalized recommendations and insights
          </p>
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            View Insights
          </button>
        </div>
      </div>
    </div>
  );
}
