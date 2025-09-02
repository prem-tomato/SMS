// app/api/reports/export/route.ts
import { query } from "@/db/database-connect";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Types for better TypeScript support
interface ReportData {
  [key: string]: any;
}

interface ExcelRowData {
  [key: string]: string | number;
}

async function fetchReportData(
  reportType: string,
  societyId: string,
  startDate: string,
  endDate: string
): Promise<ReportData[]> {
  let queryText = "";
  let queryParams: any[] = [societyId, startDate, endDate];

  switch (reportType) {
    case "member_maintenances":
      queryText = `
        SELECT 
          mmmd.month_year,
          mmmd.maintenance_amount,
          mmmd.maintenance_paid,
          mmmd.maintenance_paid_at,
          u.first_name || ' ' || u.last_name as member_name,
          u.phone,
          COALESCE(f.flat_number, hu.unit_number) as unit_number,
          COALESCE(b.name, 'Housing Unit') as building_name
        FROM member_monthly_maintenance_dues mmmd
        JOIN members m ON mmmd.member_ids @> ARRAY[m.id]
        JOIN users u ON m.user_id = u.id
        LEFT JOIN flats f ON mmmd.flat_id = f.id
        LEFT JOIN buildings b ON f.building_id = b.id
        LEFT JOIN housing_units hu ON mmmd.housing_id = hu.id
        WHERE mmmd.society_id = $1
        AND mmmd.month_year >= $2::date
        AND mmmd.month_year <= $3::date
        ORDER BY mmmd.month_year DESC, u.first_name ASC
      `;
      break;

    case "income":
      queryText = `
        SELECT 
          it.income_type,
          it.income_reason,
          it.income_amount,
          it.income_month,
          it.income_year,
          it.created_at,
          creator.first_name || ' ' || creator.last_name as created_by
        FROM income_tracking it
        JOIN users creator ON it.created_by = creator.id
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
          et.expense_type,
          et.expense_reason,
          et.expense_amount,
          et.expense_month,
          et.expense_year,
          et.created_at,
          creator.first_name || ' ' || creator.last_name as created_by
        FROM expense_tracking et
        JOIN users creator ON et.created_by = creator.id
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
          fp.amount,
          fp.reason,
          fp.is_paid,
          fp.paid_at,
          fp.payment_method,
          fp.created_at,
          f.flat_number,
          b.name as building_name,
          u.first_name || ' ' || u.last_name as member_name,
          u.phone
        FROM flat_penalties fp
        JOIN flats f ON fp.flat_id = f.id
        JOIN buildings b ON fp.building_id = b.id
        JOIN members m ON f.id = m.flat_id
        JOIN users u ON m.user_id = u.id
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
          up.amount,
          up.reason,
          up.is_paid,
          up.paid_at,
          up.payment_method,
          up.created_at,
          hu.unit_number,
          hu.unit_type,
          u.first_name || ' ' || u.last_name as member_name,
          u.phone
        FROM unit_penalties up
        JOIN housing_units hu ON up.unit_id = hu.id
        JOIN members m ON hu.id = m.housing_id
        JOIN users u ON m.user_id = u.id
        WHERE up.society_id = $1
        AND up.created_at >= $2::date
        AND up.created_at <= $3::date
        AND up.is_deleted = false
        ORDER BY up.created_at DESC
      `;
      break;

    default:
      throw new Error("Invalid report type");
  }

  const result = await query(queryText, queryParams);
  return result.rows;
}

function generatePDFReport(
  reportType: string,
  data: ReportData[],
  startDate: string,
  endDate: string
): jsPDF {
  const doc = new jsPDF();

  // Modern header with Smart Manager branding
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 35, "F");

  // Smart Manager logo/title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("bold");
  doc.text("Smart Manager", 20, 18);

  // Report type subtitle
  doc.setFontSize(10);
  doc.setFont("normal");
  doc.text(`${reportType.replace(/_/g, " ").toUpperCase()} REPORT`, 20, 26);

  // Date info aligned right
  doc.setFontSize(8);
  doc.text(`${startDate} - ${endDate}`, 210 - 20, 18, { align: "right" });
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    210 - 20,
    26,
    { align: "right" }
  );

  // Reset text color for content
  doc.setTextColor(0, 0, 0);

  // Prepare table data based on report type
  let headers: string[] = [];
  let tableData: any[][] = [];

  switch (reportType) {
    case "member_maintenances":
      headers = ["Member Name", "Unit", "Month", "Amount", "Status", "Phone"];
      tableData = data.map((row) => [
        row.member_name || "",
        row.unit_number || "",
        new Date(row.month_year).toLocaleDateString("en-IN"),
        `Rs. ${Number(row.maintenance_amount).toLocaleString("en-IN")}`,
        row.maintenance_paid ? "PAID" : "PENDING",
        row.phone || "",
      ]);
      break;

    case "income":
      headers = ["Type", "Reason", "Amount", "Period", "Created By"];
      tableData = data.map((row) => [
        row.income_type || "",
        row.income_reason || "",
        `₹${Number(row.income_amount).toLocaleString("en-IN")}`,
        `${row.income_month}/${row.income_year}`,
        row.created_by || "",
      ]);
      break;

    case "expense":
      headers = ["Type", "Reason", "Amount", "Period", "Created By"];
      tableData = data.map((row) => [
        row.expense_type || "",
        row.expense_reason || "",
        `₹${Number(row.expense_amount).toLocaleString("en-IN")}`,
        `${row.expense_month}/${row.expense_year}`,
        row.created_by || "",
      ]);
      break;

    case "flat_penalties":
    case "unit_penalties":
      headers = ["Member", "Unit", "Amount", "Reason", "Status", "Phone"];
      tableData = data.map((row) => [
        row.member_name || "",
        row.unit_number || row.flat_number || "",
        `₹${Number(row.amount).toLocaleString("en-IN")}`,
        row.reason || "",
        row.is_paid ? "✓ Paid" : "⏳ Pending",
        row.phone || "",
      ]);
      break;
  }

  // Generate clean, modern table using autoTable
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 45,
    styles: {
      fontSize: 9,
      cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
      lineColor: [226, 232, 240], // Gray-200
      lineWidth: 0.5,
      textColor: [51, 65, 85], // Slate-700
      font: "helvetica",
    },
    headStyles: {
      fillColor: [248, 250, 252], // Gray-50
      textColor: [30, 41, 59], // Slate-800
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: { top: 10, right: 6, bottom: 10, left: 6 },
    },
    bodyStyles: {
      fillColor: [255, 255, 255], // White
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Gray-50
    },
    columnStyles: {
      // Style the status column (assuming it's usually the 5th column for most reports)
      4: {
        fontStyle: "bold",
        fontSize: 8,
      },
    },
    didParseCell: function (data) {
      // Color code status cells
      if (data.cell.text && data.cell.text.length > 0) {
        const cellText = data.cell.text[0];
        if (cellText === "PAID") {
          data.cell.styles.textColor = [34, 197, 94]; // Green-500
          data.cell.styles.fillColor = [240, 253, 244]; // Green-50
        } else if (cellText === "PENDING") {
          data.cell.styles.textColor = [234, 179, 8]; // Yellow-600
          data.cell.styles.fillColor = [254, 252, 232]; // Yellow-50
        }
      }
    },
    margin: { top: 45, left: 15, right: 15, bottom: 20 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.5,
    didDrawPage: function (data) {
      // Minimal footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // Gray-400
      doc.text(`${data.pageNumber} / ${pageCount}`, 210 - 20, 297 - 10, {
        align: "right",
      });

      // Subtle brand line at bottom
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 297 - 15, 210 - 15, 297 - 15);
    },
  });

  return doc;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type");
    const format = searchParams.get("format"); // 'excel' or 'pdf'
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const societyId = searchParams.get("societyId");

    if (!reportType || !format || !startDate || !endDate || !societyId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const data = await fetchReportData(
      reportType,
      societyId,
      startDate,
      endDate
    );

    if (format === "excel") {
      // Create enhanced Excel file with Smart Manager branding

      // Prepare data with better formatting
      let excelData: ExcelRowData[] = [];
      let headers: string[] = [];

      switch (reportType) {
        case "member_maintenances":
          headers = [
            "Member Name",
            "Unit Number",
            "Month",
            "Amount (Rs.)",
            "Payment Status",
            "Phone",
          ];
          excelData = data.map((row: ReportData) => ({
            "Member Name": row.member_name || "",
            "Unit Number": row.unit_number || "",
            Month: new Date(row.month_year).toLocaleDateString("en-IN"),
            "Amount (Rs.)": Number(row.maintenance_amount) || 0,
            "Payment Status": row.maintenance_paid ? "Paid" : "Pending",
            Phone: row.phone || "",
          }));
          break;

        case "income":
          headers = [
            "Income Type",
            "Reason",
            "Amount (Rs.)",
            "Period",
            "Created By",
          ];
          excelData = data.map((row: ReportData) => ({
            "Income Type": row.income_type || "",
            Reason: row.income_reason || "",
            "Amount (Rs.)": Number(row.income_amount) || 0,
            Period: `${row.income_month}/${row.income_year}`,
            "Created By": row.created_by || "",
          }));
          break;

        case "expense":
          headers = [
            "Expense Type",
            "Reason",
            "Amount (Rs.)",
            "Period",
            "Created By",
          ];
          excelData = data.map((row: ReportData) => ({
            "Expense Type": row.expense_type || "",
            Reason: row.expense_reason || "",
            "Amount (Rs.)": Number(row.expense_amount) || 0,
            Period: `${row.expense_month}/${row.expense_year}`,
            "Created By": row.created_by || "",
          }));
          break;

        case "flat_penalties":
        case "unit_penalties":
          headers = [
            "Member Name",
            "Unit Number",
            "Amount (Rs.)",
            "Reason",
            "Payment Status",
            "Phone",
          ];
          excelData = data.map((row: ReportData) => ({
            "Member Name": row.member_name || "",
            "Unit Number": row.unit_number || row.flat_number || "",
            "Amount (Rs.)": Number(row.amount) || 0,
            Reason: row.reason || "",
            "Payment Status": row.is_paid ? "Paid" : "Pending",
            Phone: row.phone || "",
          }));
          break;
      }

      // Create workbook with metadata
      const workbook = XLSX.utils.book_new();

      // Add metadata
      workbook.Props = {
        Title: `${reportType.replace(/_/g, " ").toUpperCase()} Report`,
        Subject: `Smart Manager Report - ${startDate} to ${endDate}`,
        Author: "Smart Manager",
        CreatedDate: new Date(),
      };

      // Create worksheet with title rows
      const wsData = [
        ["Smart Manager"],
        [`${reportType.replace(/_/g, " ").toUpperCase()} REPORT`],
        [`Period: ${startDate} to ${endDate}`],
        [`Generated: ${new Date().toLocaleDateString("en-IN")}`],
        [], // Empty row
        headers,
        ...excelData.map((row) =>
          headers.map((header) => row[header as keyof typeof row])
        ),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      // Style the worksheet
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

      // Set column widths
      const colWidths = headers.map(() => ({ wch: 20 }));
      worksheet["!cols"] = colWidths;

      // Merge title cells and add some basic styling info
      if (!worksheet["!merges"]) worksheet["!merges"] = [];
      worksheet["!merges"].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Smart Manager
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } } // Report title
      );

      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="SmartManager_${reportType}_${startDate}_${endDate}.xlsx"`,
        },
      });
    } else if (format === "pdf") {
      // Generate PDF using jsPDF
      const doc = generatePDFReport(reportType, data, startDate, endDate);
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="SmartManager_${reportType}_${startDate}_${endDate}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
