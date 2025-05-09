import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/campuscart';

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    // Delete existing admin if exists
    await User.deleteOne({ role: 'admin' });

    // Create new admin user with known credentials
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campuscart.com',
      password: hashedPassword,
      role: 'admin',
      verified: true
    });

    console.log('Admin user created successfully:');
    console.log({
      email: admin.email,
      password: 'admin123' // The unhashed password
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin(); 