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

dotenv.config();

// routing
import signupRoute from "./signup.js";
import signinRoute from "./signin.js";
import tripRoute from "./tripRoute.js";
import tripSocket from "../socket/tripSocket.js";
import geocodeRouter from "../socket/geoCodeRoute.js";
import weatherAlertRouter from "./weatherAlertRoute.js";
import bookRouter from "./booking.js"
import paymentRouter from "./payment.js"
import paymentVerificationRouter from "./paymentverify.js"
// import chatbox from "./chatbox.js"



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


// rest api
app.use("/api/v1", signupRoute);
app.use("/api/v1", signinRoute);
app.use("/api/v1", tripRoute);
app.use("/api", geocodeRouter);
app.use("/api", weatherAlertRouter);
app.use("/api", bookRouter)
app.use("/api/payment",paymentRouter)
app.use("/api/payment",paymentVerificationRouter)




// create http server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { rigin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN },
   transports: ["websocket", "polling"],
});

// expose io to routes (weather-alert uses this)
app.set("io", io);
tripSocket(io);


const PORT =  5000;
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