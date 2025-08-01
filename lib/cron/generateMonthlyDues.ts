import { sql } from "@vercel/postgres"; // or your PG client
import cron from "node-cron";

export async function generateMonthlyDues() {
  const today = new Date();
  const monthStart = today.toISOString().slice(0, 7) + "-01"; // e.g. 2025-07-01

  try {
    const result = await sql`
      INSERT INTO public.member_monthly_maintenance_dues (
          society_id, building_id, flat_id, member_ids, month_year,
          maintenance_amount, created_by, created_at, updated_by, updated_at
      )
      SELECT
          m.society_id,
          m.building_id,
          m.flat_id,
          ARRAY_AGG(m.id),
          CURRENT_DATE,  -- This will give you the actual current date
          f.current_maintenance,
          '537a3518-e7f7-4049-9867-7254ca1486da',
          NOW(),
          '537a3518-e7f7-4049-9867-7254ca1486da',
          NOW()
      FROM public.members m
      JOIN public.flats f ON f.id = m.flat_id
      WHERE NOT EXISTS (
          SELECT 1 FROM public.member_monthly_maintenance_dues d
          WHERE d.flat_id = m.flat_id 
          AND d.month_year = CURRENT_DATE  -- Also update this condition
      )
      GROUP BY m.society_id, m.building_id, m.flat_id, f.current_maintenance;
    `;

    console.log(`[✔] Monthly dues inserted for ${monthStart}`);
  } catch (error) {
    console.error(`[✖] Error generating dues for ${monthStart}`, error);
  }
}

// 🔒 Cron job runs once per month — 1st at 01:00 AM server time
cron.schedule(
  "0 0 1 * *", // Runs at 01:00 AM on the 1st of every month
  async () => {
    console.log(
      "🕒 Cron fired at:",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Singapore" })
    );

    console.log("⏰ Running monthly dues cron...");
    await generateMonthlyDues();
  },
  {
    timezone: "Asia/Singapore",
  }
);
