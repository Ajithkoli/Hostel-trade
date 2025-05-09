import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/campuscart';

async function checkAdmin() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(dbUrl);
    console.log('Successfully connected to MongoDB');

    // List all users
    const users = await User.find({});
    console.log('\nAll users in database:', users.map(u => ({
      id: u._id,
      email: u.email,
      role: u.role,
      verified: u.verified
    })));

    // Check for admin user specifically
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('\nFound admin user:', {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        verified: admin.verified
      });
    } else {
      console.log('\nNo admin user found. Creating one...');
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@campuscart.com',
        password: 'admin123',
        role: 'admin',
        verified: true,
        hostel: 'Admin'
      });
      console.log('Created new admin user:', {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
        verified: newAdmin.verified
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkAdmin(); 