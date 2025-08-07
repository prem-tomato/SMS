import crypto from "crypto";
import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import {
  updateMaintenanceAsPaid,
  updateMultipleMaintenanceAsPaid,
  savePaymentDetailsToDB, // <-- You must implement this
} from "./verify.model";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    maintenance_id,
    maintenance_ids,
  } = body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(sign)
    .digest("hex");

  if (expectedSign !== razorpay_signature) {
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    // Fetch full payment details from Razorpay
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
      total_fee: typeof paymentDetails.amount === "number" ? paymentDetails.amount / 100 : 0,
      razorpay_fee: typeof paymentDetails.fee === "number" ? paymentDetails.fee / 100 : 0,
      gst: typeof paymentDetails.tax === "number" ? paymentDetails.tax / 100 : 0,
      description: paymentDetails.description || null,
      maintenance_ids: maintenance_ids || (maintenance_id ? [maintenance_id] : []),
      raw_payload: paymentDetails,
    };

    console.log("Payment Data:", paymentData);

    // Store the payment details in DB
    await savePaymentDetailsToDB(paymentData);

    // Mark maintenance(s) as paid
    if (maintenance_ids && Array.isArray(maintenance_ids)) {
      await updateMultipleMaintenanceAsPaid(maintenance_ids, razorpay_payment_id);
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
