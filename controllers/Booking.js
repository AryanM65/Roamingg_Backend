const Booking = require("../Models/Booking");
const Listing = require("../Models/Listing");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createBooking = async (req, res) => {
  try {
    const {
      listingId,
      numberOfRooms,
      checkInDate,
      checkOutDate,
      guests,
      paymentMethod // 'Cash' or 'Card'
    } = req.body;

    if (!listingId || !numberOfRooms || !checkInDate || !checkOutDate || !guests || !paymentMethod) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const requestedSingles = numberOfRooms.Single || 0;
    const requestedDoubles = numberOfRooms.Double || 0;

    if (
      listing.availableRooms.Single < requestedSingles ||
      listing.availableRooms.Double < requestedDoubles
    ) {
      return res.status(400).json({
        success: false,
        message: `Insufficient room availability`,
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ success: false, message: "Invalid check-in/check-out dates" });
    }

    const totalAmount =
      (requestedSingles * listing.pricePerNight.Single +
        requestedDoubles * listing.pricePerNight.Double) * nights;

    listing.totalRevenue += totalAmount;
    await listing.save();
    // ✅ Create the booking before payment
    const booking = await Booking.create({
      user: req.user.id,
      listing: listingId,
      numberOfRooms,
      checkInDate,
      checkOutDate,
      guests,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === "Card" ? "Pending" : "Paid",
      status: "Booked",
      bookedBy: req.user.id,
    });

    if (paymentMethod === "Cash") {
      return res.status(200).json({
        success: true,
        message: "Booking created successfully with Cash payment",
        booking,
      });
    }

    // 💳 Proceed to Stripe payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title,
              description: `${requestedSingles} Single, ${requestedDoubles} Double for ${nights} nights`,
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/booking-success?bookingId=${booking._id}`,
      cancel_url: `${process.env.CLIENT_URL}/booking-cancel`,
    });

    return res.status(200).json({
      success: true,
      message: "Booking created, redirect to Stripe",
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "listing",
        // Include all fields including timestamps
      })
      .populate({
        path: "bookedBy",
        select: "name email username role profilePicture", // Add fields you want to display for user
      })
      .sort({ createdAt: -1 }); // Optional: latest bookings first

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ bookedBy: userId })
      .populate({
        path: "listing",
        model: "Listing"
      })
      .populate({
        path: "bookedBy",
        model: "User",
        select: "-password -resetPasswordToken -resetPasswordExpires -resetOTP -otpExpiry" // exclude sensitive fields
      })
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      message: "User bookings fetched successfully",
      bookings
    });
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings"
    });
  }
};


exports.markBookingAsCompleted = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    console.log("booking", booking);

    if (booking.status === "Completed") {
      return res.status(400).json({ success: false, message: "Booking is already completed" });
    }

    const listing = await Listing.findById(booking.listing);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Associated listing not found" });
    }

    // Restore room availability
    // listing.availableRooms.Single += booking.numberOfRooms.Single || 0;
    // listing.availableRooms.Double += booking.numberOfRooms.Double || 0;

    // Save updated listing
    await listing.save();

    // Update booking status
    booking.status = "Completed";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking marked as completed and rooms restored",
      booking,
    });
  } catch (error) {
    console.error("markBookingAsCompleted error:", error);
    res.status(500).json({ success: false, message: "Failed to complete booking" });
  }
};

exports.getBookingsByListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const bookings = await Booking.find({ listing: listingId })
      .populate({
        path: "listing",
        model: "Listing",
        populate: {
          path: "listedBy",
          model: "User",
        }
      })
      .populate("bookedBy") // Populates user who booked
      .exec();

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};