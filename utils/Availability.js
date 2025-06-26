const Booking = require("../Models/Booking");
const Listing = require("../Models/Listing");
exports.isListingAvailable = async (listingId, checkInDate, checkOutDate, requestedRooms) => {
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