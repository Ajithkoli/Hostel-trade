import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/campuscart';

async function resetAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    // Find admin user
    let admin = await User.findOne({ email: 'ajithkoli.cs23@rvce.edu.in' }).select('+password');
    
    if (!admin) {
      console.log('Admin user not found, creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      
      admin = await User.create({
        name: 'Ajith Koli',
        email: 'ajithkoli.cs23@rvce.edu.in',
        password: hashedPassword,
        hostel: 'Krishna',
        role: 'admin',
        verified: true
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user found, resetting password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin password reset successfully');
    }

    // Verify the password works
    const testPassword = '123456';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('Password verification test:', isMatch);
    console.log('Test password:', testPassword);
    console.log('Stored hashed password:', admin.password);

    // Log admin details
    console.log('Admin user details:', {
      name: admin.name,
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

resetAdminPassword(); 