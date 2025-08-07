import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { amount, maintenance_ids } = body;
  
  // Convert amount to paise (multiply by 100)
  const amountInPaise = Math.round(amount * 100);

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: body.receipt || "receipt#1",
      notes: {
        // Store maintenance IDs in notes for reference
        maintenance_ids: Array.isArray(maintenance_ids) 
          ? maintenance_ids.join(',') 
          : maintenance_ids || '',
      },
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}