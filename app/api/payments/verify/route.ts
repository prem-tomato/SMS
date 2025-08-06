import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { updateMaintenanceAsPaid } from "./verify.model";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    maintenance_id,
  } = body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(sign)
    .digest("hex");

  if (expectedSign === razorpay_signature) {
    try {
      // ✅ Update DB
      await updateMaintenanceAsPaid(maintenance_id, razorpay_payment_id);

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
