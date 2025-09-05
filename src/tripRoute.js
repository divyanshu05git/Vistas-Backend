import express from "express";
import { Trip } from "./db.js";
import { userMiddleware } from "./middleware.js";

const router = express.Router();

// start a new trip
router.post("/start", async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all trips (for testing)
router.get("/", async (req, res) => {
  const trips = await Trip.find();
  res.json(trips);
});

export default router;