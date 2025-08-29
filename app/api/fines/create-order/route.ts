// app/api/fines/create-order/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, fineId, currency = "INR" } = await request.json();

    if (!amount || !fineId) {
      return NextResponse.json(
        { error: "Amount and Fine ID are required" },
        { status: 400 }
      );
    }

    // ✅ Generate a short and unique receipt (max 40 chars)
    const receipt = `fine_${crypto
      .createHash("md5")
      .update(`${fineId}_${Date.now()}`)
      .digest("hex")
      .slice(0, 20)}`;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes: {
        fine_id: fineId.toString(),
        payment_type: "fine_payment",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
