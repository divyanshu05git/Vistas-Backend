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

const stateSchema = new mongoose.Schema({
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
  userId: { type: String, required: true, index: true },
  villageId: { type: mongoose.Schema.Types.ObjectId, ref: "Village", required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const paymentSchema= new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    provider: { type: String, enum: ["razorpay"], default: "razorpay" },
    amountPaise: Number,
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["CREATED", "PAID", "FAILED"], default: "CREATED" },
    orderId: String,                
    paymentIdFromGateway: String,    
    receipt: String,              
    notes: Object,
  },
  { timestamps: true
})

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
const Booking=mongoose.model("Booking",bookingSchema)
const Payment=mongoose.model("Payment",paymentSchema)
const Village=mongoose.model("Village",villageSchema)
const State=mongoose.model("State",stateSchema)


export {User, Trip ,Booking , Payment,Village};