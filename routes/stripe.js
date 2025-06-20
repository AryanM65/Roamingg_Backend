const express = require("express");
const router = express.Router();
const { handleStripeWebhook } = require("../controllers/StripeWebhook");

// Stripe requires raw body for webhook validation
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

module.exports = router;
