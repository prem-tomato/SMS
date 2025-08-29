import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { updateFinePaymentStatus } from "../fines.model";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      fineId,
    } = await request.json();

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update database
    await updateFinePaymentStatus(
      fineId,
      true,
      new Date(),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and fine updated successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
