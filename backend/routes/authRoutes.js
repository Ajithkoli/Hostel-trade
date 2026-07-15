import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerUser, loginUser, getProfile, logoutUser, forgotPassword, resetPassword, updateProfile, updateAvatar, changePassword, deleteAccount, toggleWishlist, getWishlist } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  profileUpdateValidator,
  paramIdValidator
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidator, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidator, loginUser);

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', forgotPasswordValidator, forgotPassword);

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resettoken', resetPasswordValidator, resetPassword);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logoutUser);

// @route   GET /api/auth/me
// @desc    Get current user profile (for checkAuth)
// @access  Private
router.get('/me', protect, getProfile);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update profile details
// @access  Private
router.put('/profile', protect, profileUpdateValidator, updateProfile);

// @route   PUT /api/auth/avatar
// @desc    Upload profile picture
// @access  Private
router.put('/avatar', protect, upload.single('image'), updateAvatar);

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', protect, changePasswordValidator, changePassword);

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, deleteAccount);

// @route   POST /api/auth/wishlist/:productId
// @desc    Toggle item in wishlist
// @access  Private
router.post('/wishlist/:productId', protect, paramIdValidator, toggleWishlist);

// @route   GET /api/auth/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', protect, getWishlist);


if (process.env.NODE_ENV !== 'production') {
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

      // Create admin user (Mongoose pre-save hook will hash 'admin123')
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@campuscart.com',
        password: 'admin123',
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

      // Update admin password (Mongoose pre-save hook will hash 'admin123')
      admin.password = 'admin123';
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
}

export default router;
