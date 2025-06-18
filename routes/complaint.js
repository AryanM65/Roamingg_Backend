const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
} = require("../controllers/Complaint");

// User creates a complaint
router.post("/add-complaint", auth, createComplaint);

// Admin views all complaints
router.get("/all-complaints", auth, isAdmin, getAllComplaints);

// Admin updates status
router.patch("/:id/status", auth, isAdmin, updateComplaintStatus);


module.exports = router;
