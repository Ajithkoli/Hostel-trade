import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuscart';

async function setupAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete any existing admin users
    await User.deleteMany({ role: 'admin' });
    console.log('Removed existing admin users');

    // Create new admin with known credentials
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campuscart.com',
      password: 'admin123', // Will be hashed by the pre-save middleware
      role: 'admin',
      verified: true,
      hostel: 'Admin'
    });

    console.log('Admin user created successfully:');
    console.log({
      id: admin._id,
      email: admin.email,
      role: admin.role,
      verified: admin.verified
    });

    // Verify the password can be compared correctly
    const user = await User.findOne({ email: 'admin@campuscart.com' }).select('+password');
    const isMatch = await user.matchPassword('admin123');
    console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupAdmin(); 