import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campuscart');
    console.log('Connected to MongoDB');

    // Find admin user
    let admin = await User.findOne({ email: 'ajithkoli.cs23@rvce.edu.in' }).select('+password');
    
    if (!admin) {
      console.log('Admin user not found, creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
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
      const hashedPassword = await bcrypt.hash('admin123', salt);
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin password reset successfully');
    }

    // Verify the password works
    const isMatch = await admin.matchPassword('admin123');
    console.log('Password verification test:', isMatch);

    // Log admin details
    console.log('Admin user details:', {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      verified: admin.verified
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

resetAdmin(); 