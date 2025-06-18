const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  idType: String,
  idNumber: String
}, { _id: false });

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
  numberOfRooms: {
  Single: { type: Number, default: 0 },
  Double: { type: Number, default: 0 },
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
  guests: [guestSchema],

  paymentMethod: {
    type: String,
    enum: ["Cash", "Card"],
    required: true,
  },

  status: {
    type: String,
    enum: ["Booked", "Completed"],
    default: "Booked",
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
