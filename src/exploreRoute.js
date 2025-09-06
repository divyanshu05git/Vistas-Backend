import {Village,Booking} from "./db.js";
import { Router } from "express";
import { Types } from "mongoose";
import { userMiddleware } from "./middleware.js";

const router=Router()
