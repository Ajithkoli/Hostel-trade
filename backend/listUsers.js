import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/campuscart';

const listUsers = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('\nAll users in database:');
    users.forEach(user => {
      console.log({
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        hostel: user.hostel
      });
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

listUsers(); 