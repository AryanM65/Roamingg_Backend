const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.handleStripeWebhook = async (req, res) => {
  console.log("⚡ Webhook endpoint HIT");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook signature verified");
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("📨 Incoming event type:", event.type);
  console.log("📄 Full event object:", JSON.stringify(event, null, 2));

  if (event.type === "payment_intent.succeeded") {
    const session = event.data.object;
    console.log("📦 Metadata:", metadata);
    const metadata = session.metadata;

    console.log("🎯 checkout.session.completed event received");
    console.log("📦 Metadata:", metadata);

    try {
      const Booking = require("../Models/Booking");
      const Listing = require("../Models/Listing");

      const booking = await Booking.create({
        listing: metadata.listingId,
        bookedBy: metadata.userId,
        numberOfRooms: {
          Single: Number(metadata.requestedSingles),
          Double: Number(metadata.requestedDoubles),
        },
        checkInDate: new Date(metadata.checkInDate),
        checkOutDate: new Date(metadata.checkOutDate),
        totalAmount: Number(metadata.totalAmount),
        guests: JSON.parse(metadata.guests),
        paymentMethod: "Card",
        status: "Booked",
      });

      const listing = await Listing.findById(metadata.listingId);
      listing.totalRevenue += Number(metadata.totalAmount);
      listing.bookedBy.push(metadata.userId);
      await listing.save();

      console.log("✅ Booking finalized via webhook:", booking._id);
    } catch (err) {
      console.error("❌ Booking creation failed in webhook:", err.message);
    }
  }

  res.status(200).send("Webhook received");
};
