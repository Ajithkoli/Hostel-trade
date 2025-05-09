const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'student' });
  res.json(users);
});

// @desc    Approve a user
// @route   PATCH /api/admin/users/:id/verify
// @access  Admin
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.verified) {
    res.status(400);
    throw new Error('User is already verified');
  }

  user.verified = true;
  await user.save();

  res.json({
    message: 'User verified successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      hostel: user.hostel,
      verified: user.verified,
      role: user.role
    }
  });
});

// @desc    Reject a user (delete)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ message: 'User rejected and removed' });
});

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, hostel } = req.body;

  user.name = name || user.name;
  user.email = email || user.email;
  user.hostel = hostel || user.hostel;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    hostel: updatedUser.hostel,
    verified: updatedUser.verified,
    role: updatedUser.role
  });
});

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/make-admin
// @access  Admin
const roleChange = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = user.role === 'admin' ? 'student' : 'admin';
  await user.save();

  res.json({
    message: `User role changed to ${user.role}`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = {
  getAllUsers,
  approveUser,
  rejectUser,
  updateUser,
  roleChange,
};
