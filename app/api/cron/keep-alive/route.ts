import { generateMonthlyDues } from "@/lib/cron/generateMonthlyDues";
import { NextResponse } from "next/server";

// app/api/cron/keep-alive/route.ts
export async function GET() {
  console.log(
    "🕒 Cron fired at:",
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Singapore" })
  );
  
  try {
    const result = await generateMonthlyDues();
    return NextResponse.json({ 
      message: "Monthly dues generated successfully", 
      success: true,
      result 
    });
  } catch (error : any) {
    console.error("Error in keep-alive endpoint:", error);
    return NextResponse.json({ 
      message: "Error generating monthly dues", 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
