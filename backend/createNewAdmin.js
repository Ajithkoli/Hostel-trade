import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuscart';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user with known credentials
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = {
      name: 'Admin User',
      email: 'admin@campuscart.com',
      password: hashedPassword,
      role: 'admin',
      verified: true,
      hostel: 'Admin'
    };

    // Remove existing admin if any
    await User.deleteOne({ email: adminUser.email });

    // Create new admin
    const admin = await User.create(adminUser);
    
    console.log('Admin user created successfully:');
    console.log({
      email: admin.email,
      role: admin.role,
      verified: admin.verified
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin(); 