const express = require("express");
const router = express.Router();
const { auth, isCustomer } = require("../middlewares/auth");
const { getListingFeedbacks, addFeedback, deleteFeedback, getUserFeedbacks} = require("../controllers/Feedback");

// GET all feedbacks for a listing
router.get("/feedbacks/:listingId", auth, getListingFeedbacks); // public
router.post("/addfeedback/:listingId", auth, addFeedback);
router.delete("/deletefeedback/:feedbackId", auth, deleteFeedback);
router.get("/get-user-feedbacks", auth, isCustomer,  getUserFeedbacks);


module.exports = router;
