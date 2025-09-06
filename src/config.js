import dotenv from "dotenv";
dotenv.config();

export const MONGO_URL = process.env.MONGO_URL ;
export const JWT_SECRET=process.env.JWT_SECRET ;
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;