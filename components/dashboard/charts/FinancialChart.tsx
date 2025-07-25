"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FinalBalanceData } from "../typesOfDash"

interface FinancialChartProps {
  data: FinalBalanceData
}

export const FinancialChart = ({ data }: FinancialChartProps) => {
  const chartData = [
    {
      name: "Total Expense",
      value: Math.abs(data.total_expense || 0),
      color: "#ef4444",
    },
    {
      name: "Total Maintenance",
      value: Math.abs(data.total_maintenance || 0),
      color: "#f59e0b",
    },
    {
      name: "Society Balance",
      value: Math.abs(data.society_balance || 0),
      color: "#10b981",
    },
    {
      name: "Final Balance",
      value: Math.abs(data.final_balance || 0),
      color: "#3b82f6",
    },
  ]

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
          <Tooltip
            formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Amount"]}
            labelStyle={{ color: "#374151" }}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
