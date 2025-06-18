const express = require("express");
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
//   deleteNotification,
} = require("../controllers/Notification");

const { auth } = require("../middlewares/auth");

// Create notification (Admin or system can call this)
router.post("/create-notification", auth, createNotification);

// Get logged-in user's notifications
router.get("/get-notification", auth, getUserNotifications);

// Mark a notification as read
router.patch("read-notification/:id/read", auth, markAsRead);

module.exports = router;
