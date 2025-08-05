"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { FinalBalanceData } from "../typesOfDash";
import { getSocietyTypeFromLocalStorage } from "@/lib/auth";

interface FinancialChartProps {
  data: FinalBalanceData;
}

export const FinancialChart = ({ data }: FinancialChartProps) => {
  const [societyType, setSocietyType] = useState<string | null>(null);

  useEffect(() => {
    const type = getSocietyTypeFromLocalStorage();
    setSocietyType(type);
  }, []);

  const collectedAmount =
    (data.regular_maintenance_amount || 0) +
    (societyType === "housing" ? 0 : data.pending_collected_maintenances || 0) +
    (data.total_income || 0) +
    (data.total_penalties_paid_current_month || 0);

  const chartData = [
    {
      name: "Total Expense",
      value: Math.abs(data.total_expense || 0),
      color: "#ef4444", // Red
    },
    {
      name: "Collected Amount",
      value: Math.abs(collectedAmount),
      color: "#f59e0b", // Amber
    },
    {
      name: "Opening Balance",
      value: Math.abs(data.society_balance || 0),
      color: "#10b981", // Emerald
    },
    {
      name: "Available Balance",
      value: Math.abs(data.final_balance || 0),
      color: "#3b82f6", // Blue
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      if (label === "Collected Amount") {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[250px]">
            <p className="font-medium text-gray-800 mb-2">{label}</p>
            <div className="space-y-1">
              <p className="text-sm text-orange-600">
                Penalties: ₹
                {Math.abs(
                  data.total_penalties_paid_current_month || 0
                ).toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-amber-600">
                Maintenance Amount: ₹
                {Math.abs(data.regular_maintenance_amount || 0).toLocaleString(
                  "en-IN"
                )}
              </p>
              {societyType !== "housing" && (
                <p className="text-sm text-red-600">
                  Pending Collected Maintenances: ₹
                  {Math.abs(
                    data.pending_collected_maintenances || 0
                  ).toLocaleString("en-IN")}
                </p>
              )}
              <p className="text-sm text-green-600">
                Income Collected: ₹
                {Math.abs(data.total_income || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              Amount: ₹{entry.value?.toLocaleString("en-IN")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
