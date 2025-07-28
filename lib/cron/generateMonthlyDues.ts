import { sql } from "@vercel/postgres"; // or your PG client
import cron from "node-cron";

export async function generateMonthlyDues() {
  const today = new Date();
  const monthStart = today.toISOString().slice(0, 7) + "-01"; // e.g. 2025-07-01

  try {
    const result = await sql`
      INSERT INTO public.member_monthly_dues (
        society_id,
        building_id,
        flat_id,
        member_ids,
        month_year,
        maintenance_amount,
        penalty_amount,
        created_by,
        created_at,
        updated_by,
        updated_at
      )
      SELECT
        m.society_id,
        m.building_id,
        m.flat_id,
        array_agg(m.id) AS member_ids,
        '2025-09-01'::date as month_year,
        f.current_maintenance,
        COALESCE((
          SELECT SUM(p.amount)
          FROM public.flat_penalties p
          WHERE p.flat_id = m.flat_id
            AND date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE)
            AND p.is_deleted = false
        ), 0) as penalty_amount,
        '537a3518-e7f7-4049-9867-7254ca1486da', -- created_by
        NOW(),                                  -- created_at
        '537a3518-e7f7-4049-9867-7254ca1486da', -- updated_by
        NOW()                                   -- updated_at
      FROM public.members m
      JOIN public.flats f ON f.id = m.flat_id
      GROUP BY m.society_id, m.building_id, m.flat_id, f.current_maintenance
      HAVING NOT EXISTS (
        SELECT 1 FROM public.member_monthly_dues d
        WHERE d.flat_id = m.flat_id AND d.month_year = '2025-09-01'::date
      );
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
