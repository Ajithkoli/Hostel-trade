import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   POST /api/auth/create-admin
// @desc    Create initial admin user
// @access  Public (only works if no admin exists)
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campuscart.com',
      password: hashedPassword,
      hostel: 'Krishna',
      role: 'admin',
      verified: true
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Temporary route to check admin user
router.get('/check-admin', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('+password');
    if (!admin) {
      return res.status(404).json({ message: 'No admin user found' });
    }
    res.json({
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      verified: admin.verified
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Temporary route to reset admin password
router.post('/reset-admin', async (req, res) => {
  try {
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'No admin user found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Update admin password
    admin.password = hashedPassword;
    await admin.save();

    res.json({
      message: 'Admin password reset successfully',
      email: admin.email
    });
  } catch (error) {
    console.error('Reset admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
