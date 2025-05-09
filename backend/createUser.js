import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campuscart');
    console.log('Connected to MongoDB');

    // Check if user already exists
    let user = await User.findOne({ email: 'ajithkoli.cs23@rvce.edu.in' });
    if (user) {
      console.log('User already exists');
      await mongoose.disconnect();
      return;
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    user = await User.create({
      name: 'Ajith Koli',
      email: 'ajithkoli.cs23@rvce.edu.in',
      password: hashedPassword,
      hostel: 'Krishna',
      role: 'admin',  // Setting as admin
      verified: true  // Setting as verified
    });

    console.log('User created successfully:', {
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

createUser(); 