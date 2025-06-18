const Notification = require("../Models/Notification");

// Create a notification
exports.createNotification = async (req, res) => {
  try {
    const { user, message, type, link } = req.body;

    const notification = await Notification.create({
      user,
      message,
      type,
      link,
    });

    res.status(201).json({
      success: true,
      message: "Notification created",
      notification,
    });
  } catch (error) {
    console.error("createNotification error:", error);
    res.status(500).json({ success: false, message: "Failed to create notification" });
  }
};

// Get all notifications for logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("getUserNotifications error:", error);
    res.status(500).json({ success: false, message: "Failed to get notifications" });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification marked as read", notification });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};

// Delete a notification

