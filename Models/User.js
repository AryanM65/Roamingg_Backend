const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Customer", "Admin"],
      default: "Customer",
    },

    // Forgot password & OTP
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetOTP: String,
    otpExpiry: Date,

    // Optional user info
    phone: String,
    profilePicture: String, // this will be a Cloudinary URL

    // Favorite listings
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
