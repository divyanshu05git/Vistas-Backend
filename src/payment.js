import { Router } from "express";
import RazorpayPkg from "razorpay";
import crypto from "crypto";
import { Booking ,Payment} from "./db.js";
import { userMiddleware } from "./middleware.js";
import {RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET} from "./config.js";

const Razorpay = RazorpayPkg; 
const router=Router();


const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret:RAZORPAY_KEY_SECRET,
});

router.post("/create-order", userMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: "bookingId required" });

    const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "pending") return res.status(409).json({ error: "Booking not payable" });

    // decide price (example: flat 1500 INR)
    const amount = 1500 * 100;

     console.log("Creating RZP order", {
      bookingId,
      userId: req.userId,
      amount,
      keyPresent: !!RAZORPAY_KEY_ID,
      secretPresent: !!RAZORPAY_KEY_SECRET,

    });

    // make order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: String(bookingId),
      notes: { bookingId: String(bookingId), userId: String(booking.userId) },
    });

    // store payment record
    const payment = await Payment.create({
      bookingId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
    });

    res.json({
      key: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: bookingId,
    });
  } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Could not create order" });
  }
});

export default router;
