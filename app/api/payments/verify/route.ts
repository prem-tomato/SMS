// app/api/verify-payment/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Your DB function to get society's Razorpay config by societyId
import {
  getRazorPayConfigBySocietyId,
  savePaymentDetailsToDB,
  updateMaintenanceAsPaid,
  updateMultipleMaintenanceAsPaid,
} from "./verify.model";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    maintenance_id,
    maintenance_ids,
    societyId, // Must be sent from frontend or derived from auth
  } = body;

  if (!societyId) {
    return NextResponse.json(
      { success: false, error: "societyId is required" },
      { status: 400 }
    );
  }

  // Step 1: Fetch society-specific Razorpay config
  const config = await getRazorPayConfigBySocietyId(societyId);

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

  // Step 3: Verify signature
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", razorpay_key_secret)
    .update(sign)
    .digest("hex");

  if (expectedSign !== razorpay_signature) {
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    // Step 4: Fetch payment details using society-specific client
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    const paymentData = {
      razorpay_payment_id,
      razorpay_order_id,
      bank_rrn: paymentDetails.acquirer_data?.rrn || null,
      invoice_id: paymentDetails.invoice_id || null,
      method: paymentDetails.method,
      payer_upi_id: paymentDetails.vpa || null,
      payer_account_type: paymentDetails.bank || null,
      customer_contact: paymentDetails.contact || null,
      customer_email: paymentDetails.email || null,
      total_fee:
        typeof paymentDetails.amount === "number"
          ? paymentDetails.amount / 100
          : 0,
      razorpay_fee:
        typeof paymentDetails.fee === "number" ? paymentDetails.fee / 100 : 0,
      gst:
        typeof paymentDetails.tax === "number" ? paymentDetails.tax / 100 : 0,
      description: paymentDetails.description || null,
      maintenance_ids:
        maintenance_ids || (maintenance_id ? [maintenance_id] : []),
      raw_payload: paymentDetails,
      societyId, // Include societyId in stored data
    };

    console.log("Payment Data:", paymentData);

    // Step 5: Save to DB
    await savePaymentDetailsToDB(paymentData);

    // Step 6: Update maintenance status
    if (maintenance_ids && Array.isArray(maintenance_ids)) {
      await updateMultipleMaintenanceAsPaid(
        maintenance_ids,
        razorpay_payment_id
      );
    } else if (maintenance_id) {
      await updateMaintenanceAsPaid(maintenance_id, razorpay_payment_id);
    } else {
      return NextResponse.json(
        { success: false, error: "No maintenance ID provided" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment processing failed:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification or DB update failed" },
      { status: 500 }
    );
  }
}
