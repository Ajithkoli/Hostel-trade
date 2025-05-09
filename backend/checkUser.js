import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campuscart');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'ajithkoli.cs23@rvce.edu.in' }).select('+password');
    if (user) {
      console.log('User found:', {
        email: user.email,
        role: user.role,
        verified: user.verified
      });

      // Test password match
      const isMatch = await user.matchPassword('123456');
      console.log('Password match:', isMatch);
    } else {
      console.log('User not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUser(); 