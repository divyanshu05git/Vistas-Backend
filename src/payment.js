import { Router } from "express";
import RazorpayPkg from "razorpay";
import { Booking, Payment } from "./db.js";
import { userMiddleware } from "./middleware.js";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "./config.js";

const Razorpay = RazorpayPkg;
const router = Router();

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
router.post("/create-order", userMiddleware, async (req, res) => {
  try {
    const { bookingId, orderId } = req.body || {};

    let amountInPaise;
    let receiptId;
    let notes;

    if (bookingId) {
      const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      if (booking.status !== "pending") return res.status(409).json({ error: "Booking not payable" });

      // TODO: compute real amount from booking; keep paise as integer
      amountInPaise = 1500 * 100;
      receiptId = String(bookingId);
      notes = { bookingId: String(bookingId), userId: String(req.userId) };
    } else if (orderId) {
      // If you add an Order model later, validate it here
      amountInPaise = 1500 * 100; // TODO: derive from order total
      receiptId = String(orderId);
      notes = { orderId: String(orderId), userId: String(req.userId) };
    } else {
      return res.status(400).json({ error: "bookingId or orderId required" });
    }

    const rzOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes,
    });

    await Payment.create({
      bookingId: bookingId || undefined,   // link to one of them, not both
      orderRefId: orderId || undefined,    // (avoid confusion with Razorpay order id)
      orderId: rzOrder.id,                  // Razorpay order id
      amount: rzOrder.amount,
      currency: rzOrder.currency,
      status: "CREATED",                    // match your enum casing or relax it
    });

    return res.json({
      key: RAZORPAY_KEY_ID,
      razorpayOrderId: rzOrder.id,
      amount: rzOrder.amount,
      currency: rzOrder.currency,
      bookingId: bookingId || null,
      orderId: orderId || null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Could not create order" });
  }
});

export default router;
