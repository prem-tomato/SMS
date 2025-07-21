"use client";

import { getAccessToken } from "@/lib/auth";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";

Chart.register(ArcElement, Legend, Tooltip);

interface Notice {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

interface SocietyBreakdown {
  id: string;
  name: string;
  total_buildings: number;
  total_flats: number;
  total_members: number;
}

interface DashboardData {
  total_societies: number;
  total_buildings: number;
  total_flats: number;
  occupied_flats: number;
  total_members: number;
  recent_notices: Notice[];
  societies_breakdown: SocietyBreakdown[];
}

const CircularProgress = ({
  value,
  max,
  label,
  color,
}: {
  value: number;
  max: number;
  label: string;
  color: string;
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className={color}
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
            strokeDasharray={`${percentage * 2.51}, 251.2`}
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy=".3em"
            className="text-2xl font-bold fill-current"
          >
            {value}
          </text>
        </svg>
      </div>
      <p className="mt-2 text-lg text-gray-700">{label}</p>
    </div>
  );
};


export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    total_societies: 0,
    total_buildings: 0,
    total_flats: 0,
    occupied_flats: 0,
    total_members: 0,
    recent_notices: [],
    societies_breakdown: [],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin-dashboard", {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
        const result = await response.json();
        if (
          result.message === "admin dashboard listed successfully" &&
          result.data
        ) {
          setData(result.data);
        } else {
          console.warn("Unexpected API response:", result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    }
    fetchData();
  }, []);

  const chartData = {
    labels: ["Occupied Flats", "Vacant Flats"],
    datasets: [
      {
        data: [
          data.occupied_flats,
          Math.max(data.total_flats - data.occupied_flats, 0),
        ],
        backgroundColor: ["#3B82F6", "#E5E7EB"],
        borderColor: ["#2563EB", "#D1D5DB"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#374151",
        },
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <CircularProgress
          value={data.total_societies}
          max={20}
          label="Societies"
          color="text-blue-500"
        />
        <CircularProgress
          value={data.total_buildings}
          max={50}
          label="Buildings"
          color="text-green-500"
        />
        <CircularProgress
          value={data.total_flats}
          max={50}
          label="Flats"
          color="text-purple-500"
        />
        <CircularProgress
          value={data.occupied_flats}
          max={data.total_flats || 50}
          label="Occupied"
          color="text-orange-500"
        />
        <CircularProgress
          value={data.total_members}
          max={50}
          label="Members"
          color="text-red-500"
        />
      </div>

      {/* Charts & Notices */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Flat Occupancy Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Flat Occupancy
          </h2>
          <div className="w-full max-w-xs mx-auto">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Notices */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Recent Notices
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-gray-600">Title</th>
                  <th className="p-3 text-gray-600">Date</th>
                  <th className="p-3 text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_notices.length > 0 ? (
                  data.recent_notices.map((notice) => (
                    <tr
                      key={notice.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{notice.title}</td>
                      <td className="p-3">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            notice.status === "open"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {notice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-3 text-center text-gray-500">
                      No notices available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Society Breakdown */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Society Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-gray-600">Society</th>
                <th className="p-3 text-gray-600">Buildings</th>
                <th className="p-3 text-gray-600">Flats</th>
                <th className="p-3 text-gray-600">Members</th>
              </tr>
            </thead>
            <tbody>
              {data.societies_breakdown.length > 0 ? (
                data.societies_breakdown.map((society) => (
                  <tr
                    key={society.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {society.name}
                    </td>
                    <td className="p-3">{society.total_buildings}</td>
                    <td className="p-3">{society.total_flats}</td>
                    <td className="p-3">{society.total_members}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">
                    No societies data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
