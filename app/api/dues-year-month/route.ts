import { query } from "@/db/database-connect";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const queryText = `
        SELECT
            DISTINCT TO_CHAR(month_year, 'YYYY-MM-DD') AS month_year
        FROM member_monthly_dues
        ORDER BY month_year DESC;
    `;

    const res = await query(queryText);

    return NextResponse.json(res.rows, { status: 200 });
  } catch (error: any) {
    console.error("Error getting dues year month:", error);
    return NextResponse.json(
      { error: `Error getting dues year month: ${error.message || error}` },
      { status: 500 }
    );
  }
};
