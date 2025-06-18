const Feedback = require("../Models/Feedback");
const Listing = require("../Models/Listing");

exports.getListingFeedbacks = async (req, res) => {
  try {
    const { listingId } = req.params;

    const feedbacks = await Feedback.find({ listing: listingId })
      .populate("user", "name email") // only show basic user info
      .sort({ createdAt: -1 }); // recent first

    res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get feedbacks",
    });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;
    const { rating, comment } = req.body;

    // Validate listing existence
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Prevent duplicate feedback (1 feedback per user per listing)
    const existingFeedback = await Feedback.findOne({ user: userId, listing: listingId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted feedback for this listing",
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      user: userId,
      listing: listingId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("addFeedback error:", error);
    res.status(500).json({ success: false, message: "Failed to submit feedback" });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Allow only owner or admin
    if (feedback.user.toString() !== userId.toString() && userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this feedback",
      });
    }

    await Feedback.findByIdAndDelete(feedbackId);

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("deleteFeedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
    });
  }
};

exports.getUserFeedbacks = async (req, res) => {
  try {
    const userId = req.user.id;

    const feedbacks = await Feedback.find({ user: userId })
      .populate({
        path: "user",
        select: "-password -resetPasswordToken -resetPasswordExpires -resetOTP -otpExpiry"
      })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User feedbacks fetched successfully",
      feedbacks,
    });
  } catch (error) {
    console.error("Error fetching user feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user feedbacks",
    });
  }
};