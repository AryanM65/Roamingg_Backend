const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin user
    required: true,
  },
  targetAudience: {
    type: String,
    enum: ["All", "Customer", "Admin"],
    default: "All",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Announcement", announcementSchema);
