// app/reports/page.tsx
"use client";

import { getSocietyIdFromLocalStorage } from "@/lib/auth";
import {
  AlertCircle,
  Calendar,
  Download,
  FileText,
  Filter,
  Search,
} from "lucide-react";
import React, { useState } from "react";

interface ReportFormData {
  reportType: string;
  startDate: string;
  endDate: string;
  societyId: string;
}

export default function ReportsPage() {
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: "",
    startDate: "",
    endDate: "",
    societyId: getSocietyIdFromLocalStorage()!,
  });
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string>("");

  const reportTypes = [
    { value: "member_maintenances", label: "Member Maintenances" },
    { value: "income", label: "Income Tracking" },
    { value: "expense", label: "Expense Tracking" },
    { value: "flat_penalties", label: "Flat Penalties" },
    { value: "unit_penalties", label: "Unit Penalties" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.reportType) {
      setError("Please select a report type");
      return false;
    }
    if (!formData.startDate) {
      setError("Please select a start date");
      return false;
    }
    if (!formData.endDate) {
      setError("Please select an end date");
      return false;
    }
    if (!formData.societyId) {
      setError("Please select a society");
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date must be before end date");
      return false;
    }
    return true;
  };

  const fetchReport = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        type: formData.reportType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        societyId: formData.societyId,
      });

      const response = await fetch(`/api/reports?${params}`);
      const result = await response.json();

      if (result.success) {
        setReportData(result.data);
        if (result.data.length === 0) {
          setError("No data found for the selected criteria");
        }
      } else {
        setError(result.error || "Failed to fetch report data");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while fetching the report");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: "excel" | "pdf") => {
    if (!validateForm() || reportData.length === 0) {
      setError("Please generate a report first");
      return;
    }

    setExporting(true);
    try {
      const params = new URLSearchParams({
        type: formData.reportType,
        format: format,
        startDate: formData.startDate,
        endDate: formData.endDate,
        societyId: formData.societyId,
      });

      const response = await fetch(`/api/reports/export?${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${formData.reportType}_${formData.startDate}_${
          formData.endDate
        }.${format === "excel" ? "xlsx" : "pdf"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError("Failed to export report");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while exporting the report");
    } finally {
      setExporting(false);
    }
  };

  const renderTableHeaders = () => {
    switch (formData.reportType) {
      case "member_maintenances":
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month/Year
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
          </tr>
        );
      case "income":
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month/Year
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        );
      case "expense":
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month/Year
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        );
      case "flat_penalties":
      case "unit_penalties":
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    return reportData.map((row, index) => {
      switch (formData.reportType) {
        case "member_maintenances":
          return (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.first_name} {row.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.unit_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(row.month_year).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ₹{Number(row.maintenance_amount).toLocaleString("en-IN")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.maintenance_paid
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {row.maintenance_paid ? "Paid" : "Pending"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.phone}
              </td>
            </tr>
          );
        case "income":
          return (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.income_type}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {row.income_reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                ₹{Number(row.income_amount).toLocaleString("en-IN")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.income_month}/{row.income_year}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.created_by_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(row.created_at).toLocaleDateString("en-IN")}
              </td>
            </tr>
          );
        case "expense":
          return (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.expense_type}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {row.expense_reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                ₹{Number(row.expense_amount).toLocaleString("en-IN")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.expense_month}/{row.expense_year}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.created_by_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(row.created_at).toLocaleDateString("en-IN")}
              </td>
            </tr>
          );
        case "flat_penalties":
        case "unit_penalties":
          return (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.first_name} {row.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.unit_number || row.flat_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                ₹{Number(row.amount).toLocaleString("en-IN")}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {row.reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.is_paid
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {row.is_paid ? "Paid" : "Pending"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(row.created_at).toLocaleDateString("en-IN")}
              </td>
            </tr>
          );
        default:
          return null;
      }
    });
  };

  const getReportTitle = () => {
    const reportTypeLabel =
      reportTypes.find((type) => type.value === formData.reportType)?.label ||
      "";
    return reportTypeLabel;
  };

  const calculateTotals = () => {
    if (reportData.length === 0) return null;

    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    reportData.forEach((row) => {
      switch (formData.reportType) {
        case "member_maintenances":
          totalAmount += Number(row.maintenance_amount);
          if (row.maintenance_paid) {
            paidAmount += Number(row.maintenance_amount);
          } else {
            pendingAmount += Number(row.maintenance_amount);
          }
          break;
        case "income":
          totalAmount += Number(row.income_amount);
          break;
        case "expense":
          totalAmount += Number(row.expense_amount);
          break;
        case "flat_penalties":
        case "unit_penalties":
          totalAmount += Number(row.amount);
          if (row.is_paid) {
            paidAmount += Number(row.amount);
          } else {
            pendingAmount += Number(row.amount);
          }
          break;
      }
    });

    return { totalAmount, paidAmount, pendingAmount };
  };

  const totals = calculateTotals();

  return (
    <div className="p-2">
      <div className="">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Report Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type <span className="text-red-500">*</span>
              </label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Report Type</option>
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loading ? "Generating..." : "Generate Report"}
            </button>

            <button
              onClick={() => exportReport("excel")}
              disabled={exporting || reportData.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Excel
            </button>

            <button
              onClick={() => exportReport("pdf")}
              disabled={exporting || reportData.length === 0}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Export PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {totals && reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totals.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {(formData.reportType === "member_maintenances" ||
              formData.reportType.includes("penalties")) && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Download className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Paid Amount
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{totals.paidAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Pending Amount
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        ₹{totals.pendingAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Results Card */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getReportTitle()} ({reportData.length} records)
                </h2>
                <div className="text-sm text-gray-500">
                  {new Date(formData.startDate).toLocaleDateString("en-IN")} to{" "}
                  {new Date(formData.endDate).toLocaleDateString("en-IN")}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>{renderTableHeaders()}</thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderTableRows()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          reportData.length === 0 &&
          formData.reportType &&
          !error && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Data Found
              </h3>
              <p className="text-gray-500">
                No records found for the selected filters. Try adjusting your
                date range or report type.
              </p>
            </div>
          )}

        {/* Initial State */}
        {!loading &&
          reportData.length === 0 &&
          !formData.reportType &&
          !error && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Generate Your First Report
              </h3>
              <p className="text-gray-500">
                Select the filters above and click "Generate Report" to get
                started.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
