import { NextResponse } from "next/server";
import { generateMonthlyDues } from "@/lib/cron/generateMonthlyDues";

export async function GET() {
  console.log(
    "🕒 Cron fired at:",
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Singapore" })
  );

  await generateMonthlyDues();

  return NextResponse.json({ message: "Monthly dues generated" });
}
