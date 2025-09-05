import crypto from "crypto";
import {Booking , Payment} from "../src/db.js";
import { getRazor } from "../services/razorpay.service.js";


// export const processPayment=(req, res)=>{
//   res.status(200).json({
//     success:true
//   })
// }