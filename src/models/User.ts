import mongoose from 'mongoose';

// Define User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  workosId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  userDetails: {
    height: Number,
    weight: Number,
    age: Number,
    gender: String,
    goal: String,
    activityLevel: String,
  }
});

// Get or create User model
export const User = mongoose.model('User', UserSchema); 