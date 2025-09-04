import Razorpay from "razorpay";

let rInstance=null;

export function getRazor(){
    if(rInstance) return rInstance;

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) throw new Error("Razorpay keys missing in .env");

    rInstance = new Razorpay({ key_id, key_secret });
    return rInstance;
}

