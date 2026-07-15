import Notification from "../models/Notification.js";
import asyncHandler from "express-async-handler";

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // keep history clean (last 50)
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationRead = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (!notification.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to read this notification" });
    }

    notification.read = true;
    const updatedNotification = await notification.save();
    res.json(updatedNotification);
  } catch (error) {
    res.status(400).json({ message: "Failed to update notification", error: error.message });
  }
});

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(400).json({ message: "Failed to update notifications", error: error.message });
  }
});
