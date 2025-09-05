import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import crypto from "crypto";
import Razorpay from "razorpay";
import { success } from "zod";
import http from "http";
import { Server } from "socket.io";


//razor pay API
// export const instance= new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_API_SECRET,
// });

// app.route("/payment/process").post(processPayment);



// routing
import signupRoute from "./signup.js";
import signinRoute from "./signin.js";
import tripRoute from "./tripRoute.js";
import tripSocket from "../socket/tripSocket.js";
import geocodeRouter from "../socket/geoCodeRoute.js";
import weatherAlertRouter from "./weatherAlertRoute.js";
import bookRouter from "./booking.js"



// .env
const {
  NODE_ENV = "development",
  CORS_ORIGIN = "*",
  DB_NAME = "Vistas",
} = process.env;



const app = express();

// middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN, credentials: true }));
if (NODE_ENV !== "production") app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// rest api
app.use("/api/v1", signupRoute);
app.use("/api/v1", signinRoute);
app.use("/api/v1", tripRoute);
app.use("/api", geocodeRouter);
app.use("/api", weatherAlertRouter);
app.use("/api", bookRouter)



// create http server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { rigin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN },
   transports: ["websocket", "polling"],
});

// expose io to routes (weather-alert uses this)
app.set("io", io);

// initialize socket
tripSocket(io);

const PORT =  3000;

async function main() {
  try {
    // mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected");

    server.listen(PORT, () => {
        console.log("Server running on port " + PORT);
        console.log(`CORS origin: ${CORS_ORIGIN}`);
      });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

main();