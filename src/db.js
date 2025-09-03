import mongoose from "mongoose";
import dotenv from "dotenv";


const { Types } = mongoose;

const statusTypes = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, umique:true },
  password: { type: String, required: true },
});

const villageSchema = new mongoose.Schema({
  stateId: { type: Types.ObjectId, ref: "State" },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  location: {
    long: { type: Number, required: true },
    lat: { type: Number, required: true },
  },
});

const statesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
});

const orderSchema = new mongoose.Schema({
  userId: [{ type: Types.ObjectId }],
  craftId: [{ type: Types.ObjectId }],
  quantity: { type: Number, required: true },
  orderDate: { type: Date, required: true },
  status: {
    type: String,
    enum: statusTypes,
    default: "pending",
    required: true,
  },
  paymentId: [{ type: Types.ObjectId }],
});

const handiCraftsSchema = new mongoose.Schema({
  villageId: { type: Types.ObjectId, ref: "Village" },
  craftName: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  stock: { type: Number },
  category: { type: String },
  image: { type: String },
});

const eventSchema = new mongoose.Schema({
  villageId: { type: Types.ObjectId, ref: "Village", req: true },
  title: { type: String },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number },
  image: { type: String },
});

const bookingSchema = new mongoose.Schema({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  package_id: { type: Types.ObjectId, ref: "Package", required: true },
  booking_date: { type: Date, required: true, default: Date.now },
  status: {type:Boolean , default:false},
  payment_id: { type: Types.ObjectId, ref: "Payment", default: null },
});

const tripSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    startLocation: { type: String },
    destination: { type: String },
    currentLocation: {
      lat: Number,
      lng: Number,
    },

    status: { type: String, default: "ongoing" },
    alerts: [{ message: String, time: Date }],
  },
  { timestamps: true }
);



const User = mongoose.model("User", userSchema);
const Trip=mongoose.model("Trip", tripSchema);

export {User, Trip};