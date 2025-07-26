// app/api/cron/generate-dues/route.ts
import { NextResponse } from "next/server";
import { generateMonthlyDues } from "@/lib/cron/generateMonthlyDues";

export async function POST() {
  await generateMonthlyDues();
  return NextResponse.json({ success: true });
}
