const express = require("express");
const { createBooking, getAllBookings, getUserBookings, markBookingAsCompleted, getBookingsByListing } = require("../controllers/Booking");
const { auth, isAdmin, isCustomer } = require("../middlewares/auth");

const router = express.Router();

// POST /api/bookings - create a new booking
router.post("/create-booking", auth, createBooking);

// GET /api/bookings - get all bookings
router.get("/all-bookings", auth, isAdmin, getAllBookings);

router.get("/my-bookings", auth, isCustomer, getUserBookings);
router.put("/complete-booking/:bookingId", auth, markBookingAsCompleted);
router.get("/booking/:listingId", auth, isAdmin, getBookingsByListing);

module.exports = router;
