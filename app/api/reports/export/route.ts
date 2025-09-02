// app/api/reports/export/route.ts
import { query } from "@/db/database-connect";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
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
        ORDER up.created_at DESC
      `;
      break;

    default:
      throw new Error("Invalid report type");
  }

  const result = await query(queryText, queryParams);
  return result.rows;
}

function generateHTMLForPDF(
  reportType: string,
  data: ReportData[],
  startDate: string,
  endDate: string
): string {
  // Prepare table data based on report type
  let headers: string[] = [];
  let tableRows: string[] = [];

  switch (reportType) {
    case "member_maintenances":
      headers = ["Member Name", "Unit", "Month", "Amount", "Status", "Phone"];
      tableRows = data.map(
        (row) => `
        <tr>
          <td>${row.member_name || ""}</td>
          <td>${row.unit_number || ""}</td>
          <td>${new Date(row.month_year).toLocaleDateString("en-IN")}</td>
          <td>₹${Number(row.maintenance_amount).toLocaleString("en-IN")}</td>
          <td><span class="status ${
            row.maintenance_paid ? "paid" : "pending"
          }">${row.maintenance_paid ? "PAID" : "PENDING"}</span></td>
          <td>${row.phone || ""}</td>
        </tr>
      `
      );
      break;

    case "income":
      headers = ["Type", "Reason", "Amount", "Period", "Created By"];
      tableRows = data.map(
        (row) => `
        <tr>
          <td>${row.income_type || ""}</td>
          <td>${row.income_reason || ""}</td>
          <td>₹${Number(row.income_amount).toLocaleString("en-IN")}</td>
          <td>${row.income_month}/${row.income_year}</td>
          <td>${row.created_by || ""}</td>
        </tr>
      `
      );
      break;

    case "expense":
      headers = ["Type", "Reason", "Amount", "Period", "Created By"];
      tableRows = data.map(
        (row) => `
        <tr>
          <td>${row.expense_type || ""}</td>
          <td>${row.expense_reason || ""}</td>
          <td>₹${Number(row.expense_amount).toLocaleString("en-IN")}</td>
          <td>${row.expense_month}/${row.expense_year}</td>
          <td>${row.created_by || ""}</td>
        </tr>
      `
      );
      break;

    case "flat_penalties":
    case "unit_penalties":
      headers = ["Member", "Unit", "Amount", "Reason", "Status", "Phone"];
      tableRows = data.map(
        (row) => `
        <tr>
          <td>${row.member_name || ""}</td>
          <td>${row.unit_number || row.flat_number || ""}</td>
          <td>₹${Number(row.amount).toLocaleString("en-IN")}</td>
          <td>${row.reason || ""}</td>
          <td><span class="status ${row.is_paid ? "paid" : "pending"}">${
          row.is_paid ? "PAID" : "PENDING"
        }</span></td>
          <td>${row.phone || ""}</td>
        </tr>
      `
      );
      break;
  }

  const headerCells = headers.map((header) => `<th>${header}</th>`).join("");
  const tableBody = tableRows.join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Smart Manager Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #2D3748;
          background: #FFFFFF;
        }

        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0;
        }

        .header {
          background: linear-gradient(135deg, #1E1EE4 0%, #2563EB 100%);
          padding: 32px 40px;
          color: white;
          margin-bottom: 40px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .report-title {
          font-size: 14px;
          font-weight: 500;
          opacity: 0.9;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .date-info {
          text-align: right;
          font-size: 12px;
          opacity: 0.9;
        }

        .date-range {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .generated-date {
          font-size: 11px;
          opacity: 0.7;
        }

        .content {
          padding: 0 40px 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1E1EE4;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 11px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-container {
          background: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #E2E8F0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        th {
          background: #F8FAFC;
          color: #374151;
          font-weight: 600;
          padding: 16px 12px;
          text-align: left;
          border-bottom: 2px solid #E2E8F0;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 14px 12px;
          border-bottom: 1px solid #F1F5F9;
          color: #374151;
        }

        tr:hover {
          background: #F8FAFC;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status.paid {
          background: #ECFDF5;
          color: #059669;
        }

        .status.pending {
          background: #FEF3C7;
          color: #D97706;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E2E8F0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #9CA3AF;
        }

        .footer-brand {
          font-weight: 600;
        }

        .page-break {
          page-break-after: always;
        }

        @media print {
          .header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .status.paid,
          .status.pending {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div>
              <div class="brand">Smart Manager</div>
              <div class="report-title">${reportType.replace(
                /_/g,
                " "
              )} Report</div>
            </div>
            <div class="date-info">
              <div class="date-range">${startDate} - ${endDate}</div>
              <div class="generated-date">Generated ${new Date().toLocaleDateString(
                "en-IN"
              )}</div>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.length}</div>
              <div class="stat-label">Total Records</div>
            </div>
            ${
              reportType.includes("penalties")
                ? `
              <div class="stat-card">
                <div class="stat-number">${
                  data.filter((row) => row.is_paid).length
                }</div>
                <div class="stat-label">Paid</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${
                  data.filter((row) => !row.is_paid).length
                }</div>
                <div class="stat-label">Pending</div>
              </div>
            `
                : reportType === "member_maintenances"
                ? `
              <div class="stat-card">
                <div class="stat-number">${
                  data.filter((row) => row.maintenance_paid).length
                }</div>
                <div class="stat-label">Paid</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${
                  data.filter((row) => !row.maintenance_paid).length
                }</div>
                <div class="stat-label">Pending</div>
              </div>
            `
                : `
              <div class="stat-card">
                <div class="stat-number">₹${data
                  .reduce(
                    (sum, row) =>
                      sum +
                      Number(
                        row[
                          reportType === "income"
                            ? "income_amount"
                            : "expense_amount"
                        ] || 0
                      ),
                    0
                  )
                  .toLocaleString("en-IN")}</div>
                <div class="stat-label">Total Amount</div>
              </div>
            `
            }
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>${headerCells}</tr>
              </thead>
              <tbody>
                ${tableBody}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div class="footer-brand">Smart Manager</div>
            <div>Confidential Report</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function generatePDFWithPuppeteer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
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
      // Excel generation remains the same as in original code
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

      const workbook = XLSX.utils.book_new();
      workbook.Props = {
        Title: `${reportType.replace(/_/g, " ").toUpperCase()} Report`,
        Subject: `Smart Manager Report - ${startDate} to ${endDate}`,
        Author: "Smart Manager",
        CreatedDate: new Date(),
      };

      const wsData = [
        ["Smart Manager"],
        [`${reportType.replace(/_/g, " ").toUpperCase()} REPORT`],
        [`Period: ${startDate} to ${endDate}`],
        [`Generated: ${new Date().toLocaleDateString("en-IN")}`],
        [],
        headers,
        ...excelData.map((row) =>
          headers.map((header) => row[header as keyof typeof row])
        ),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      const colWidths = headers.map(() => ({ wch: 20 }));
      worksheet["!cols"] = colWidths;

      if (!worksheet["!merges"]) worksheet["!merges"] = [];
      worksheet["!merges"].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }
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
      // Generate PDF using Puppeteer
      const html = generateHTMLForPDF(reportType, data, startDate, endDate);
      const pdfBuffer = await generatePDFWithPuppeteer(html);

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
