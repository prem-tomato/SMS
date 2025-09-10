// app/api/reports/route.ts
import { query } from "@/db/database-connect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const societyId = searchParams.get("societyId");

    if (!reportType || !startDate || !endDate || !societyId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    let queryText = "";
    let queryParams: any[] = [societyId, startDate, endDate];

    switch (reportType) {
      case "member_maintenances":
        queryText = `
          SELECT 
            mmmd.id,
            mmmd.month_year,
            mmmd.maintenance_amount,
            mmmd.maintenance_paid,
            mmmd.maintenance_paid_at,
            u.first_name,
            u.last_name,
            u.phone,
            COALESCE(f.flat_number, hu.unit_number) as unit_number,
            COALESCE(b.name, 'Housing Unit') as building_name,
            s.name as society_name
          FROM member_monthly_maintenance_dues mmmd
          JOIN members m ON mmmd.member_ids @> ARRAY[m.id]
          JOIN users u ON m.user_id = u.id
          JOIN societies s ON mmmd.society_id = s.id
          LEFT JOIN flats f ON mmmd.flat_id = f.id
          LEFT JOIN buildings b ON f.building_id = b.id
          LEFT JOIN housing_units hu ON mmmd.housing_id = hu.id
          WHERE mmmd.society_id = $1
          AND mmmd.month_year >= $2::date
          AND mmmd.month_year <= $3::date
          AND mmmd.created_at IS NOT NULL
          ORDER BY mmmd.month_year DESC, u.first_name ASC
        `;
        break;

      case "income":
        queryText = `
          SELECT 
            it.id,
            it.income_type,
            it.income_reason,
            it.income_amount,
            it.income_month,
            it.income_year,
            it.created_at,
            creator.first_name as created_by_name,
            s.name as society_name
          FROM income_tracking it
          JOIN users creator ON it.created_by = creator.id
          JOIN societies s ON it.society_id = s.id
          WHERE it.society_id = $1
          AND it.created_at >= $2::date
          AND it.created_at <= $3::date
          AND it.is_deleted = false
          ORDER BY it.created_at DESC
        `;
        break;

      case "expense":
        queryText = `
          SELECT 
            et.id,
            et.expense_type,
            et.expense_reason,
            et.expense_amount,
            et.expense_month,
            et.expense_year,
            et.created_at,
            creator.first_name as created_by_name,
            s.name as society_name
          FROM expense_tracking et
          JOIN users creator ON et.created_by = creator.id
          JOIN societies s ON et.society_id = s.id
          WHERE et.society_id = $1
          AND et.created_at >= $2::date
          AND et.created_at <= $3::date
          AND et.is_deleted = false
          ORDER BY et.created_at DESC
        `;
        break;

      case "flat_penalties":
        queryText = `
          SELECT
              fp.id,
              fp.amount,
              fp.reason,
              fp.is_paid,
              fp.paid_at,
              fp.payment_method,
              fp.created_at,
              f.flat_number,
              b.name as building_name,
              u.first_name,
              u.last_name,
              u.phone,
              s.name as society_name
          FROM flat_penalties fp
          JOIN flats f ON fp.flat_id = f.id
          JOIN buildings b ON fp.building_id = b.id
          LEFT JOIN members m ON f.id = m.flat_id
          LEFT JOIN users u ON m.user_id = u.id
          JOIN societies s ON fp.society_id = s.id
          WHERE fp.society_id = $1
          AND fp.created_at >= $2::date
          AND fp.created_at <= $3::date
          AND fp.is_deleted = false
          ORDER BY fp.created_at DESC
        `;
        break;

      case "unit_penalties":
        queryText = `
          SELECT 
            up.id,
            up.amount,
            up.reason,
            up.is_paid,
            up.paid_at,
            up.payment_method,
            up.created_at,
            hu.unit_number,
            hu.unit_type,
            u.first_name,
            u.last_name,
            u.phone,
            s.name as society_name
          FROM unit_penalties up
          JOIN housing_units hu ON up.unit_id = hu.id
          JOIN members m ON hu.id = m.housing_id
          JOIN users u ON m.user_id = u.id
          JOIN societies s ON up.society_id = s.id
          WHERE up.society_id = $1
          AND up.created_at >= $2::date
          AND up.created_at <= $3::date
          AND up.is_deleted = false
          ORDER BY up.created_at DESC
        `;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: result.rows,
      reportType,
      startDate,
      endDate,
      totalRecords: result.rowCount,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
