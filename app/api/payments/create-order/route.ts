// app/api/create-order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getRazorPayConfigBySocietyId } from "../verify/verify.model";

// Service to fetch society-specific Razorpay config

export async function POST(req: Request) {
  const body = await req.json();

  const { amount, maintenance_ids, societyId } = body;

  if (!societyId) {
    return NextResponse.json(
      { error: "society_id is required" },
      { status: 400 }
    );
  }

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: "Valid amount is required" },
      { status: 400 }
    );
  }

  // Step 1: Fetch society-specific Razorpay credentials
  const config = await getRazorPayConfigBySocietyId(societyId);

  if (!config || !config.razorpay_key_id || !config.razorpay_key_secret) {
    return NextResponse.json(
      { error: "Razorpay configuration not found for this society" },
      { status: 400 }
    );
  }

  const { razorpay_key_id, razorpay_key_secret } = config;

  // Step 2: Create Razorpay instance with society-specific credentials
  const razorpay = new Razorpay({
    key_id: razorpay_key_id,
    key_secret: razorpay_key_secret,
  });

  const amountInPaise = Math.round(amount * 100);

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: body.receipt || `receipt#${Date.now()}`,
      notes: {
        maintenance_ids: Array.isArray(maintenance_ids)
          ? maintenance_ids.join(",")
          : maintenance_ids || "",
        societyId,
      },
    });

    return NextResponse.json({ order, razorpay_key_id });
  } catch (err: any) {
    console.error("Razorpay Order Creation Error:", err);
    return NextResponse.json(
      {
        error: "Failed to create Razorpay order",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
