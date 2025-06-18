const User = require('../Models/User');
const Listing = require('../Models/Listing');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const {generateOTP, generateToken} = require('../utils/tokenUtils');

require('dotenv').config();


exports.signup = async (req, res) => {
  try {
    console.log("req.body", req.body);
    console.log("req.file", req.file);
    const { name, username, email, password, role, phone } = req.body;
    const profileFile = req.file; // multer provides this

    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "All fields are required: name, username, email, password",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User with this email or username already exists",
      });
    }

    // Upload profile picture if exists
    let profilePicture = null;
    if (profileFile?.path) {
      const uploadResult = await uploadOnCloudinary(profileFile.path);
      profilePicture = uploadResult?.secure_url || null;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role,
      phone,
      profilePicture,
    });

    await newUser.save();

    // ✅ Send welcome email
    await sendEmail(
      email,
      "Welcome to Roamingg!",
      `Hello ${name},\n\nWelcome to Roamingg! We’re excited to have you on board. Happy booking! 🧳\n\n- The Roamingg Team`
    );

    return res.status(200).json({
      status: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to create user. Please try again later.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    let user = await User.findOne({ email }).populate("favourites");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ success: false, message: "Invalid password" });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Remove sensitive fields before sending response
    const { password: _P, resetPasswordToken, resetPasswordExpires, resetOTP, otpExpiry, ...safeUser } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: safeUser,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

  
 exports.logout = (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

exports.sendOTP = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const otp = generateOTP();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  
      user.resetOTP = otp;
      user.otpExpiry = expiry;
      await user.save();
  
      await sendEmail(
        user.email,
        'Your OTP Code',
        `Your OTP is: ${otp}. It expires in 5 minutes.`
      );
  
      res.json({ message: 'OTP sent to email' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  };

   exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetOTP || !user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (user.resetOTP !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after verification
    user.resetOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access to cookie
      secure: process.env.NODE_ENV === "production", // true only on production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // allows cross-origin in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });


    res.json({ message: 'OTP verified, login successful', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

exports.getFavoriteListings = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("getFavoriteListings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch favorites" });
  }
};

exports.addToFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { listingId } = req.body;

    // Optional: Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const user = await User.findById(userId);

    if (!user.favorites.includes(listingId)) {
      user.favorites.push(listingId);
      await user.save();
      return res.status(200).json({ success: true, message: "Listing added to favorites" });
    }

    return res.status(200).json({ success: true, message: "Listing already in favorites" });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return res.status(500).json({ success: false, message: "Failed to add to favorites" });
  }
};

// ✅ View any user profile by ID (excluding sensitive fields)
exports.viewUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpires -resetOTP -otpExpiry")
      .populate("favourites");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error viewing profile:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user profile" });
  }
};

// ✅ Edit your own profile (must be logged in)
exports.editUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone } = req.body;

    let profilePicture = undefined;

    // Upload new profile picture if file is uploaded
    if (req.file?.path) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      profilePicture = uploadResult?.secure_url;
    }

    const updatedFields = {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(profilePicture && { profilePicture }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires -resetOTP -otpExpiry");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error editing profile:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

exports.removeFromFavourites = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = req.params.id;

    const user = await User.findById(userId);
    user.favourites = user.favourites.filter(id => id.toString() !== listingId);
    await user.save();

    return res.status(200).json({ message: "Listing removed from favourites." });
  } catch (err) {
    return res.status(500).json({ message: "Error removing from favourites", error: err.message });
  }
};