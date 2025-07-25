"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { SocietyBreakdown } from "../typesOfDash"

interface SocietyStatsChartProps {
  societies: SocietyBreakdown[]
}

export const SocietyStatsChart = ({ societies }: SocietyStatsChartProps) => {
  const chartData = societies.map((society) => ({
    name: society.name.length > 10 ? society.name.substring(0, 10) + "..." : society.name,
    buildings: society.total_buildings,
    flats: society.total_flats,
    members: society.total_members,
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="buildings" fill="#3b82f6" name="Buildings" radius={[2, 2, 0, 0]} />
          <Bar dataKey="flats" fill="#10b981" name="Flats" radius={[2, 2, 0, 0]} />
          <Bar dataKey="members" fill="#f59e0b" name="Members" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
