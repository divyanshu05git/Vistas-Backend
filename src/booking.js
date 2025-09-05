import {Village,Booking} from "./db.js";
import { Router } from "express";
import { Types } from "mongoose";
import { userMiddleware } from "./middleware.js";

const router = Router();

router.post("/book",userMiddleware, async (req,res)=>{
    try {
        const userId = req.userId; 
        const { villageId } = req.body;
        
        if (!villageId || !Types.ObjectId.isValid(villageId)) {
           return res.status(400).json({ error: "Valid villageId is required" });
        }

        console.log("village id is valid")

        const village = await Village.findById(villageId).lean();
        if (!village) {
            console.log("village not found")
            return res.status(404).json({ error: "Village not found" });
            
        }
        
        const booking = await Booking.create({
            userId,
            villageId,
            status: "pending",
            createdAt: new Date()
        });

        
        return res.status(201).json({
            ok: true,
            booking: {
                id: booking._id,
                status: booking.status,
                createdAt: booking.createdAt
            },
            village: {
                id: village._id,
                name: village.name,
                image: village.image,
                location: village.location
            }
        });

    } catch (e) {
        console.error("Book error:", e);
        return res.status(500).json({ error: "Internal server error" });
    }
})


export default router;