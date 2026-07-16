import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Product from "../models/Product.js";
import ChatMessage from "../models/ChatMessage.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import sendEmail from "../utils/email.js";
import { uploadToCloudinary, extractPublicId, deleteFromCloudinary } from "../utils/cloudinary.js";

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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
    profilePicture: user.profilePicture,
    wishlist: user.wishlist || [],
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
      verified: user.verified,
      profilePicture: user.profilePicture,
      wishlist: user.wishlist || []
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("There is no user with that email");
  }

  // Generate random token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire time (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Create reset URL targeting the frontend route
  const resetUrl = `${req.protocol}://${req.get("host").replace("5000", "5173")}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please follow this link to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <p><a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
             <p>If you did not request this, please ignore this email.</p>`,
    });

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("Forgot password email error:", err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Set new password (the pre-save middleware in User.js hashes the password automatically)
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful. You can now log in.",
  });
});

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, hostel } = req.body;

  user.name = name || user.name;
  user.hostel = hostel !== undefined ? hostel : user.hostel;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    hostel: updatedUser.hostel,
    role: updatedUser.role,
    profilePicture: updatedUser.profilePicture,
    verified: updatedUser.verified,
  });
});

// @desc    Upload / Update profile picture
// @route   PUT /api/auth/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a file");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Upload to Cloudinary
  const imageUrl = await uploadToCloudinary(req.file.path);
  if (!imageUrl) {
    res.status(500);
    throw new Error("Failed to upload image to Cloudinary");
  }

  // Delete the old profile picture from Cloudinary if it's not the default avatar
  if (user.profilePicture && !user.profilePicture.includes("default-avatar")) {
    const publicId = extractPublicId(user.profilePicture);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  user.profilePicture = imageUrl;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    hostel: user.hostel,
    role: user.role,
    profilePicture: user.profilePicture,
    verified: user.verified,
  });
});

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide both current and new passwords");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Find all products owned by this user
  const products = await Product.find({ user: user._id });

  // Delete all product images from Cloudinary
  for (const product of products) {
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        const publicId = extractPublicId(image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }
  }

  // Delete products from DB
  await Product.deleteMany({ user: user._id });

  // Delete user avatar from Cloudinary if not default
  if (user.profilePicture && !user.profilePicture.includes("default-avatar")) {
    const publicId = extractPublicId(user.profilePicture);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  // Delete all chat messages involving this user
  await ChatMessage.deleteMany({
    $or: [{ sender: user._id }, { receiver: user._id }],
  });

  // Delete user
  await user.deleteOne();

  // Clear cookie
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ success: true, message: "Account and associated data deleted successfully" });
});

// @desc    Toggle wishlist item (Add/Remove)
// @route   POST /api/auth/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!user.wishlist) {
    user.wishlist = [];
  }

  const index = user.wishlist.indexOf(productId);
  let message = "";

  if (index === -1) {
    user.wishlist.push(productId);
    message = "Product added to wishlist";
  } else {
    user.wishlist.splice(index, 1);
    message = "Product removed from wishlist";
  }

  await user.save();

  res.json({ success: true, message, wishlist: user.wishlist });
});

// @desc    Get user wishlist
// @route   GET /api/auth/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: { path: "user", select: "name email hostel" }
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user.wishlist || []);
});

export { registerUser, loginUser, getProfile, logoutUser, forgotPassword, resetPassword, updateProfile, updateAvatar, changePassword, deleteAccount, toggleWishlist, getWishlist };
