import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/campuscart';

const updateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    // Update all users to include verified field
    const result = await User.updateMany(
      { verified: { $exists: false } },
      { $set: { verified: false } }
    );

    // Set admin users as verified
    await User.updateMany(
      { role: 'admin' },
      { $set: { verified: true } }
    );

    console.log(`Updated ${result.modifiedCount} users`);
    console.log('Update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

updateUsers(); 