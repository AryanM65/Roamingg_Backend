const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    images: [
      {
        type: String, // URL or file path
      },
    ],
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    roomTypes: {
      type: [String],
      enum: ["Single", "Double"],
      default: ["Single", "Double"],
    },
    availableRooms: {
      Single: {
        type: Number,
        default: 0,
      },
      Double: {
        type: Number,
        default: 0,
      },
    },
    pricePerNight: {
      Single: {
        type: Number,
        required: true,
      },
      Double: {
        type: Number,
        required: true,
      },
    },
    bookedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
