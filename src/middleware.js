import {JWT_SECRET} from "./config.js"
import jwt from "jsonwebtoken"


export const userMiddleware=async(req,res)=>{
    try {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

       
        const decoded = jwt.verify(token , JWT_SECRET) 

       
        req.userId = decoded.id;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized user" });
    }
}