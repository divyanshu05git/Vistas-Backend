import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import crypto from "crypto";
import Razorpay from "razorpay";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

//razor pay API
const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



// routing
import signupRoute from "./signup.js";
import signinRoute from "./signin.js";
import tripRoute from "./tripRoute.js";
import tripSocket from "../socket/tripSocket.js";
import geocodeRouter from "../socket/geoCodeRoute.js";
import weatherAlertRouter from "./weatherAlertRoute.js";


dotenv.config();

// .env
const {
  NODE_ENV = "development",
  CORS_ORIGIN = "*",
  DB_NAME = "Vistas",
} = process.env;

const MONGO_CONN_STR =
  "mongodb+srv://prodjplchatgpt_db_user:vrdwlWtZRcAF3HmG@vistas.tufxssb.mongodb.net/?retryWrites=true&w=majority&appName=Vistas";

// if (!MONGO_URI) {
//   console.error("Missing MONGO_URI in .env");
//   process.exit(1);
// }

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
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGO_CONN_STR, { dbName: DB_NAME });
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