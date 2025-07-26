"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FinalBalanceData } from "../typesOfDash";

interface FinancialChartProps {
  data: FinalBalanceData;
}

export const FinancialChart = ({ data }: FinancialChartProps) => {
  // Original chart data - keeping only 4 main bars
  const chartData = [
    {
      name: "Total Expense",
      value: Math.abs(data.total_expense || 0),
      color: "#ef4444",
    },
    {
      name: "Collected Amount",
      value: Math.abs(data.total_maintenance || 0),
      color: "#f59e0b",
    },
    {
      name: "Opening Balance",
      value: Math.abs(data.society_balance || 0),
      color: "#10b981",
    },
    {
      name: "Available Balance",
      value: Math.abs(data.final_balance || 0),
      color: "#3b82f6",
    },
  ];

  // Custom tooltip - shows breakdown only for Collected Amount
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // For Collected Amount, show the 3 specific breakdown values
      if (label === "Collected Amount") {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[250px]">
            <p className="font-medium text-gray-800 mb-2">{label}</p>
            <div className="space-y-1">
              <p className="text-sm text-blue-600">
                Collected Amount: ₹{Math.abs(data.total_maintenance || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-orange-600">
                Penalties: ₹{Math.abs(data.total_penalties || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-amber-600">
                Maintenance Amount: ₹{Math.abs(data.raw_maintenance_amount || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        );
      }
      
      // For other bars, show standard tooltip
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

  // Choose which approach to use:
  const useStackedChart = false; // Always false since we want only 4 main bars

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
          
          {/* Custom tooltip for all bars */}
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};