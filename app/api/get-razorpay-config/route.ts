import { NextRequest, NextResponse } from "next/server";
import { getRazorPayConfigBySocietyId } from "../payments/verify/verify.model";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const society_id = searchParams.get("society_id");

  if (!society_id) {
    return NextResponse.json(
      { error: "society_id is required" },
      { status: 400 }
    );
  }

  const config = await getRazorPayConfigBySocietyId(society_id);

  if (!config) {
    return NextResponse.json(
      { error: "Razorpay configuration not found for this society" },
      { status: 400 }
    );
  }

  return NextResponse.json({ config });
};
