"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslations } from "next-intl";

interface OccupancyChartProps {
  occupied: number;
  total: number;
}

export const OccupancyChart = ({ occupied, total }: OccupancyChartProps) => {
  const t = useTranslations("OccupancyChart");

  const data = [
    { name: t("occupied"), value: occupied, color: "#3b82f6" },
    { name: t("vacant"), value: total - occupied, color: "#e5e7eb" },
  ];

  const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="w-full h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, t("flats")]}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">{percentage}%</div>
          <div className="text-sm text-gray-600">{t("occupied")}</div>
        </div>
      </div>
    </div>
  );
};
