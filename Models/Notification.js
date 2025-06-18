const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["booking", "feedback", "announcement", "approval", "complaint", "other"],
    default: "other",
  },
  link: {
    type: String, // Optional URL for redirection
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Notification", notificationSchema);
