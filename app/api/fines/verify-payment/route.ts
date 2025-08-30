import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getRazorPayConfigBySocietyId } from "../../payments/verify/verify.model";
import {
  updateFinePaymentStatus,
  updateFinePaymentStatusForUnitPenalties,
} from "../fines.model";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      fineId,
      society_id,
      society_type,
    } = await request.json();

    console.log("societyType from verify-payment", society_type);

    const config = await getRazorPayConfigBySocietyId(society_id);

    if (!config || !config.razorpay_key_id || !config.razorpay_key_secret) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay configuration not found for this society",
        },
        { status: 400 }
      );
    }

    const { razorpay_key_id, razorpay_key_secret } = config;

    // Step 2: Create dynamic Razorpay instance
    const razorpay = new Razorpay({
      key_id: razorpay_key_id,
      key_secret: razorpay_key_secret,
    });

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

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
    if (society_type === "housing") {
      await updateFinePaymentStatusForUnitPenalties(
        fineId,
        true,
        new Date(),
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentDetails.method
      );
    } else {
      await updateFinePaymentStatus(
        fineId,
        true,
        new Date(),
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentDetails.method
      );
    }

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
