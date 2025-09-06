import { Router } from "express";
import crypto from "crypto";
import { Booking ,Payment} from "./db.js";
import { userMiddleware } from "./middleware.js";

const router=Router();


router.post("/verify", userMiddleware, async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    //  HMAC
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: "Signature mismatch" });
    }

    
    await Payment.findOneAndUpdate(
      { orderId: razorpayOrderId },
      { $set: { paymentId: razorpayPaymentId, signature: razorpaySignature, status: "paid" } }
    );

    await Booking.findOneAndUpdate(
      { _id: bookingId, userId: req.userId },
      { $set: { status: "confirmed" } }
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
