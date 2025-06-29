const Listing = require("../Models/Listing");
const Booking = require("../Models/Booking");
const User = require("../Models/User")
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate("listedBy", "name email profilePicture");
    res.status(200).json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listings",
    });
  }
};

exports.createListing = async (req, res) => {
  try {
    console.log("req.body",req.body);
    console.log("req.file", req.files);
    const {
      title,
      description,
      location,
      roomTypes,
      availableRooms,
      pricePerNight,
    } = req.body;
    // Convert JSON strings to actual JS objects/arrays
    const parsedLocation = JSON.parse(location); // Expects { address }
    const parsedRoomTypes = JSON.parse(roomTypes); // Expects ["Single", "Double"]
    const parsedAvailableRooms = JSON.parse(availableRooms); // Expects { Single: 2, Double: 3 }
    const parsedPricePerNight = JSON.parse(pricePerNight); // Expects { Single: 1000, Double: 1500 }
    const latitude = parsedLocation.latitude;
    const longitude = parsedLocation.longitude;
    // Upload images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadResponses = await Promise.all(
        req.files.map((file) => uploadOnCloudinary(file.path))
      );

      imageUrls = uploadResponses
        .filter((resp) => resp && resp.secure_url)
        .map((resp) => resp.secure_url);
    }

    // Use coordinates from external geocoding later (placeholder for now)

    const newListing = new Listing({
      title,
      description,
      location: {
        address: parsedLocation.address,
        latitude,
        longitude,
      },
      roomTypes: parsedRoomTypes,
      availableRooms: parsedAvailableRooms,
      pricePerNight: parsedPricePerNight,
      images: imageUrls,
      listedBy: req.user.id,
    });

    await newListing.save();

    res.status(201).json({
      message: "Listing created successfully",
      listing: newListing,
    });
  } catch (error) {
    console.error("Error in createListing:", error.message);
    res.status(500).json({
      message: "Failed to create listing",
      error: error.message,
    });
  }
};


exports.editListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const updateData = req.body;

    // Find listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Handle image update
    if (req.files && req.files.length > 0) {
      const uploadResponses = await Promise.all(
        req.files.map(file => uploadOnCloudinary(file.path))
      );
      const newImageUrls = uploadResponses
        .filter(resp => resp && resp.secure_url)
        .map(resp => resp.secure_url);
      
      updateData.images = newImageUrls;
    }

    // Update the listing
    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("editListing error:", error);
    res.status(500).json({ message: "Failed to update listing", error: error.message });
  }
};

const isListingAvailable = async (listingId, checkInDate, checkOutDate, requestedRooms) => {
  const overlappingBookings = await Booking.find({
    listing: listingId,
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate }
  });

  let bookedRooms = { Single: 0, Double: 0 };

  overlappingBookings.forEach(booking => {
    bookedRooms.Single += booking.numberOfRooms.Single;
    bookedRooms.Double += booking.numberOfRooms.Double;
  });

  const listing = await Listing.findById(listingId);
  if (!listing) return { available: false, message: "Listing not found" };

  const available = {
    Single: listing.availableRooms.Single - bookedRooms.Single,
    Double: listing.availableRooms.Double - bookedRooms.Double
  };

  return {
    available:
      requestedRooms.Single <= available.Single &&
      requestedRooms.Double <= available.Double,
    remaining: available
  };
};
exports.checkAvailability = async (req, res) => {
  try {
    const listingId = req.params.id;
    const { checkInDate, checkOutDate, numberOfRooms } = req.body;

    const result = await isListingAvailable(
      listingId,
      new Date(checkInDate),
      new Date(checkOutDate),
      numberOfRooms
    );

    if (!result.available) {
      return res.status(400).json({
        success: false,
        message: "Rooms not available for the selected dates",
        remainingRooms: result.remaining
      });
    }

    res.json({
      success: true,
      message: "Rooms are available",
      remainingRooms: result.remaining
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId)
      .populate("listedBy", "name email") // optional: show who listed it
      .exec();

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({ listing });
  } catch (error) {
    console.error("Error fetching listing:", error.message);
    res.status(500).json({ message: "Failed to fetch listing", error: error.message });
  }
};

exports.toggleListingStatus = async (req, res) => {
  try {
    console.log("reached");
    console.log("req.body", req.body);
    const { id } = req.params;
    const { isActive } = req.body;
    console.log(typeof isActive);

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be a boolean value" });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    listing.isActive = isActive;
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Listing has been ${isActive ? "activated" : "deactivated"} successfully`,
      listing,
    });
  } catch (error) {
    console.error("Error toggling listing status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.addToFavourites = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = req.params.id;

    const user = await User.findById(userId);
    if (!user.favourites.includes(listingId)) {
      user.favourites.push(listingId);
      await user.save();
    }

    return res.status(200).json({ message: "Listing added to favourites." });
  } catch (err) {
    return res.status(500).json({ message: "Error adding to favourites", error: err.message });
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