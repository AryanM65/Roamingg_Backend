const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const {
  createAnnouncement,
  getAllAnnouncements,
//   deleteAnnouncement,
} = require("../controllers/Announcement");

// Create announcement (admin only)
router.post("/create-announcement", auth, isAdmin, createAnnouncement);

// Get all announcements (open to all authenticated users)
router.get("/all-announcements", auth, getAllAnnouncements);

// Delete announcement (admin only)
// router.delete("/:id", auth, isAdmin, deleteAnnouncement);

module.exports = router;
