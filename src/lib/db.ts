import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/fit1';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnected: boolean;
}

declare global {
  var mongoose: GlobalMongoose;
}

if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
    isConnected: false,
  };
}

export async function connectDB() {
  try {
    console.log('📡 Attempting to connect to MongoDB...');

    if (global.mongoose.isConnected) {
      console.log('🟢 Using existing MongoDB connection');
      return global.mongoose.conn;
    }

    if (!global.mongoose.promise) {
      const opts = {
        bufferCommands: false,
        autoIndex: true, // Build indexes
        maxPoolSize: 10, // Maintain up to 10 socket connections
      };

      console.log(`🔄 Connecting to MongoDB at ${MONGODB_URI}`);
      global.mongoose.promise = mongoose.connect(MONGODB_URI, opts);
      global.mongoose.conn = mongoose;
    }

    await global.mongoose.promise;
    global.mongoose.isConnected = true;

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('🟢 MongoDB connected successfully');
      const dbName = mongoose.connection.db?.databaseName || 'unknown';
      console.log(`📊 Connected to database: ${dbName}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 MongoDB connection error:', err);
      global.mongoose.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 MongoDB disconnected');
      global.mongoose.isConnected = false;
    });

    // Log connection readyState
    console.log('📊 Connection ReadyState:', mongoose.connection.readyState);
    
    return global.mongoose.conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    global.mongoose.promise = null;
    global.mongoose.isConnected = false;
    throw error;
  }
}

// Export the connection function and connection status
export const isConnected = () => global.mongoose.isConnected;
export default connectDB; 