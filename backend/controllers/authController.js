import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, hostel } = req.body;

  console.log('Starting registration process for:', email);

  try {
    const userExists = await User.findOne({ email });
    console.log('Existing user check:', userExists ? 'User exists' : 'User does not exist');
    
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      hostel,
      verified: false,
      role: "student"
    });

    console.log('User created successfully:', user._id);

    if (user) {
      res.status(201).json({
        message: "Registration successful. Please wait for admin approval.",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          hostel: user.hostel,
          role: user.role,
          verified: user.verified
        }
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email and include password field
  const user = await User.findOne({ email }).select("+password");
  
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Check verification for non-admin users
  if (user.role !== "admin" && !user.verified) {
    res.status(403);
    throw new Error("Account is pending approval. Please wait for admin verification.");
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || "your-default-secret",
    { expiresIn: "30d" }
  );

  // Set JWT token in cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Send response without password
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    hostel: user.hostel,
    role: user.role,
    verified: user.verified,
    token
  });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      hostel: user.hostel,
      role: user.role,
      verified: user.verified
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export { registerUser, loginUser, getProfile };
