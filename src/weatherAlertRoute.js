// src/weatherAlertRoute.js
import express from "express";
import axios from "axios";

const router = express.Router();


const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY; // set in .env
const INTERNAL_API_BASE = process.env.INTERNAL_API_BASE || "http://localhost:3000/api"; // where your geocode proxy lives
const WEATHER_TIMEOUT_MS = 10_000;
const GEOCODE_TIMEOUT_MS = 10_000;

// Optional debug logging
const WEATHER_DEBUG = process.env.WEATHER_DEBUG === "1";

// ---- Helpers ----
function isBadWeather(weather) {
  const main = weather?.weather?.[0]?.main || "";
  // tweak this list per your needs
  return ["Thunderstorm", "Drizzle", "Rain", "Snow", "Extreme"].includes(main);
}

function logDebug(...args) {
  if (WEATHER_DEBUG) console.log("[weather-alert]", ...args);
}


router.post("/weather-alert", async (req, res) => {
  try {
    // 0) Key sanity
    if (!OPENWEATHER_KEY) {
      return res.status(500).json({
        error: "OPENWEATHER_KEY is not configured",
        hint: "Add OPENWEATHER_KEY=... to your .env and restart the server.",
      });
    }

    const { placeName, tripId } = req.body || {};

    let lat = req.body?.lat;
    let lng = req.body?.lng;
    let display_name = null;

    
    if (typeof lat === "number" && typeof lng === "number") {
      
      try {
        const rev = await axios.get(`${INTERNAL_API_BASE}/reverse`, {
          params: { lat, lng },
          timeout: GEOCODE_TIMEOUT_MS,
        });
        display_name = rev.data?.display_name || `${lat}, ${lng}`;
      } catch {
        display_name = `${lat}, ${lng}`;
      }
    } else {
      // coords not provided → geocode required
      if (!placeName) {
        return res.status(400).json({
          error: "placeName required (or provide lat & lng instead)",
        });
      }

      try {
        const geoResp = await axios.get(`${INTERNAL_API_BASE}/geocode`, {
          params: { q: placeName },
          timeout: GEOCODE_TIMEOUT_MS,
        });
        if (!Array.isArray(geoResp.data) || geoResp.data.length === 0) {
          return res.status(404).json({ error: "place not found" });
        }
        lat = geoResp.data[0].lat;
        lng = geoResp.data[0].lng;
        display_name = geoResp.data[0].display_name || placeName;
      } catch (err) {
        if (err.response) {
          return res.status(err.response.status).json({
            error: "Upstream error",
            service: "geocode-proxy",
            details: err.response.data,
          });
        }
        return res.status(502).json({
          error: "Geocode failed",
          details: err.message || "unknown error",
        });
      }
    }

    logDebug("Resolved coords:", { lat, lng, display_name });

    // 2) Weather check (OpenWeather)
    let weatherResp;
    try {
      weatherResp = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
          lat,
          lon: lng, // NOTE: OWM uses 'lon'
          appid: OPENWEATHER_KEY,
          units: "metric",
        },
        timeout: WEATHER_TIMEOUT_MS,
      });
    } catch (err) {
      if (err.response) {
        // bubble up provider details (e.g., 401 Invalid API key)
        return res.status(err.response.status).json({
          error: "Upstream error",
          service: "openweathermap",
          details: err.response.data,
        });
      }
      return res.status(502).json({
        error: "Weather provider error",
        details: err.message || "unknown axios/network error",
      });
    }

    const bad = isBadWeather(weatherResp.data);
    logDebug("Weather main:", weatherResp.data?.weather?.[0]?.main, "bad?", bad);

    // 3) Send alert over socket if bad
    if (bad) {
      const io = req.app.get("io"); // set in server.js
      const alertPayload = {
        type: "Weather",
        place: display_name,
        coords: { lat, lng },
        weather: weatherResp.data.weather?.[0]?.description || "bad weather",
        ts: Date.now(),
      };

      if (tripId) {
        io?.to(tripId).emit("receiveAlert", alertPayload);
      } else {
        io?.emit("receiveAlert", alertPayload);
      }

      return res.json({ ok: true, alertSent: true, data: alertPayload });
    }

    // otherwise, no alert
    return res.json({ ok: true, alertSent: false, weather: weatherResp.data });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
});

export default router;
