import express from "express";
import {z} from "zod";
import bcrypt from "bcrypt";
import {User} from './db.js'


const router = express.Router();

router.post("/signup",async (req,res)=>{
    const requiredBody=z.object({
        name: z.string(),
        email:z.string().email(),
        password: z.string().min(6)

    })

    const parsed=requiredBody.safeParse(req.body);
    if(!parsed.success){
        return res.status(400).json({
            error: "Invalid inputs",
        })
    }

    const { name, email, password } = parsed.data;
    const hashedPassword=await bcrypt.hash(password,10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered, please log in instead.",
      });
    }

    try{
        await User.create({
            name: name,
            email:email,
            password: hashedPassword
        })

        res.json({
            message: "account created"
        })
    }
    catch(err){
        res.json({
            message: "error while signing up"
        })
    }

})

export default router;