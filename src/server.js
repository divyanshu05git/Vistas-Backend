import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// routing
import signupRoute from "./signup.js";
import signinRoute from "./signin.js";
import tripRoute from "./tripRoute.js";
import tripSocket from "../socket/tripSocket.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// rest api
app.use("/api/v1", signupRoute);
app.use("/api/v1", signinRoute);
app.use("/api/v1", tripRoute);

// create http server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// initialize socket
tripSocket(io);

const PORT =  3000;

async function main() {
  try {
    await mongoose.connect("mongodb+srv://prodjplchatgpt_db_user:vrdwlWtZRcAF3HmG@vistas.tufxssb.mongodb.net/?retryWrites=true&w=majority&appName=Vistas");
    console.log(" MongoDB Connected");

    server.listen(PORT, () => console.log("Server running on port " + PORT));
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

main();