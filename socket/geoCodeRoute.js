// geocodeRoute.js
import express from "express";
import axios from "axios";

const router = express.Router();

// Forward geocoding: text -> coords
// GET /api/geocode?q=Connaught Place Delhi
router.get("/geocode", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing q" });

  try {
    const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q,
        format: "json",
        addressdetails: 1,
        limit: 5,
      },
      headers: {
        "User-Agent": "TripApp/1.0 (contact@example.com)", // put your contact
      },
      timeout: 10000,
    });

    res.json(
      data.map((r) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        display_name: r.display_name,
        address: r.address,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Geocode failed", details: err?.message });
  }
});

// Reverse geocoding: coords -> place
// GET /api/reverse?lat=28.6139&lng=77.2090
router.get("/reverse", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "Missing lat or lng" });

  try {
    const { data } = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon: lng,
        format: "json",
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "TripApp/1.0 (contact@example.com)", // put your contact
      },
      timeout: 10000,
    });

    res.json({  
      lat: parseFloat(data?.lat),
      lng: parseFloat(data?.lon),
      display_name: data?.display_name,
      address: data?.address,
    });
  } catch (err) {
    res.status(500).json({ error: "Reverse geocode failed", details: err?.message });
  }
});

export default router;
