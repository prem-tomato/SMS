import { sql } from "@vercel/postgres"; // or your PG client
import cron from "node-cron";

export async function generateMonthlyDues() {
  const today = new Date();
  const monthStart = today.toISOString().slice(0, 7) + "-01"; // e.g. 2025-07-01

  try {
    const result = await sql`
      INSERT INTO public.member_monthly_maintenance_dues (
        society_id,
        building_id,
        flat_id,
        housing_id,
        member_ids,
        month_year,
        maintenance_amount,
        created_by,
        created_at,
        updated_by,
        updated_at
      )
      -- 🎯 1. FLAT MEMBERS
      SELECT
        m.society_id,
        m.building_id,
        m.flat_id,
        NULL::uuid AS housing_id,
        ARRAY_AGG(m.id),
        DATE_TRUNC('month', CURRENT_DATE),
        f.current_maintenance,
        '537a3518-e7f7-4049-9867-7254ca1486da'::uuid,
        NOW(),
        '537a3518-e7f7-4049-9867-7254ca1486da'::uuid,
        NOW()
      FROM public.members m
      JOIN public.flats f ON f.id = m.flat_id
      WHERE m.flat_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM public.member_monthly_maintenance_dues d
          WHERE d.flat_id = m.flat_id
            AND d.month_year = DATE_TRUNC('month', CURRENT_DATE)
      )
      GROUP BY m.society_id, m.building_id, m.flat_id, f.current_maintenance

      UNION ALL
      -- 🎯 2. HOUSING UNIT MEMBERS
      SELECT
        m.society_id,
        NULL::uuid AS building_id,
        NULL::uuid AS flat_id,
        m.housing_id,
        ARRAY_AGG(m.id),
        DATE_TRUNC('month', CURRENT_DATE),
        h.current_maintenance,
        '537a3518-e7f7-4049-9867-7254ca1486da'::uuid,
        NOW(),
        '537a3518-e7f7-4049-9867-7254ca1486da'::uuid,
        NOW()
      FROM public.members m
      JOIN public.housing_units h ON h.id = m.housing_id
      WHERE m.housing_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM public.member_monthly_maintenance_dues d
          WHERE d.housing_id = m.housing_id
            AND d.month_year = DATE_TRUNC('month', CURRENT_DATE)
      )
      GROUP BY m.society_id, m.housing_id, h.current_maintenance
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
