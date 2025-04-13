import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">
        AI Fitness Tracker
      </h1>
      
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
