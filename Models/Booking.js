const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomType: {
    type: String,
    enum: ["Single", "Double"],
    required: true,
  },
  numberOfRooms: {
    type: Number,
    required: true,
    min: 1,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },

  // 🧾 Payment tracking as an object
  paymentStatus: {
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },

  // 🚩 Booking status lifecycle
  status: {
    type: String,
    enum: ["Booked", "Cancelled", "Completed"],
    default: "Booked",
  }

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
