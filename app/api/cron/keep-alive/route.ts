// app/api/cron/keep-alive/route.ts
import { NextResponse } from "next/server";
import "@/lib/cron/generateMonthlyDues"; // ✅ This registers the cron

export async function GET() {
  return NextResponse.json({ message: "Cron registered." });
}
