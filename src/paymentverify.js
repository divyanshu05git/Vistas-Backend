import { Router } from "express";
import crypto from "crypto";
import { Booking, Payment } from "./db.js";
import { userMiddleware } from "./middleware.js";
import { RAZORPAY_KEY_SECRET } from "./config.js";

const router = Router();

// POST /api/payment/verify
router.post("/verify", userMiddleware, async (req, res) => {
  try {
    const { bookingId, orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body).digest("hex");
    if (expected !== razorpaySignature) {
      return res.status(400).json({ error: "Signature mismatch" });
    }

    // mark payment paid
    await Payment.findOneAndUpdate(
      { orderId: razorpayOrderId }, // this is Razorpay's order_id
      { $set: { paymentId: razorpayPaymentId, signature: razorpaySignature, status: "PAID" } }
    );

    // If it was for a booking, confirm it
    if (bookingId) {
      await Booking.findOneAndUpdate(
        { _id: bookingId, userId: req.userId },
        { $set: { status: "confirmed" } }
      );
    }
    // If you add an Order model later, update it here using orderId

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
