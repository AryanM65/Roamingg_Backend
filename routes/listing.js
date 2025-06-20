const express = require("express");
const router = express.Router();
const {createListing, editListing, checkListingAvailability, getListingById, toggleListingStatus, getAllListings, checkAvailability} = require("../controllers/Listing");
const { auth, isCustomer, isAdmin } = require("../middlewares/auth");
const {upload} = require("../middlewares/multer")

router.post("/addlisting", auth, isAdmin, upload.array("images", 5), createListing);
router.put("/editlisting", auth, isAdmin, upload.array("images", 5), editListing);
router.post("/:id/availability", checkAvailability);
router.get("/listing/:id", auth, getListingById);
router.get("/all-listings", getAllListings);
router.put("/:id/status", auth, isAdmin, toggleListingStatus);

module.exports = router;

