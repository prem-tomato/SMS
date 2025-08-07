import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { updateMaintenanceAsPaid, updateMultipleMaintenanceAsPaid } from "./verify.model";

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

  if (expectedSign === razorpay_signature) {
    try {
      // Handle multiple maintenance IDs (multi-month payment)
      if (maintenance_ids && Array.isArray(maintenance_ids)) {
        await updateMultipleMaintenanceAsPaid(maintenance_ids, razorpay_payment_id);
      } 
      // Handle single maintenance ID (single month payment)
      else if (maintenance_id) {
        await updateMaintenanceAsPaid(maintenance_id, razorpay_payment_id);
      }
      else {
        return NextResponse.json(
          { success: false, error: "No maintenance ID provided" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DB update failed:", error);
      return NextResponse.json(
        { success: false, error: "DB update failed" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }
}