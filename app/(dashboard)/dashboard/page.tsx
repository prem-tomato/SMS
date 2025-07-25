"use client";

import {
  getAccessToken,
  getSocietyIdFromLocalStorage,
  getUserRole,
} from "@/lib/auth";
import { cn } from "@/utils/cn";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  BarElement,
  CategoryScale
);

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

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface DashboardData {
  total_societies: number;
  total_buildings: number;
  total_flats: number;
  occupied_flats: number;
  total_members: number;
  recent_notices: Notice[];
  societies_breakdown: SocietyBreakdown[];
  members_list: Member[];
  all_notices: Notice[];
}

interface FinalBalanceData {
  society_name: string;
  society_balance: number;
  total_expense: number;
  total_maintenance: number;
  final_balance: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    total_societies: 0,
    total_buildings: 0,
    total_flats: 0,
    occupied_flats: 0,
    total_members: 0,
    recent_notices: [],
    societies_breakdown: [],
    members_list: [],
    all_notices: [],
  });
  const [role, setRole] = useState<string | null>(null);
  const [finalBalance, setFinalBalance] = useState<FinalBalanceData | null>(
    null
  );

  async function fetchData() {
    const userRole = getUserRole();
    setRole(userRole);

    const headers = {
      Authorization: `Bearer ${getAccessToken()}`,
    };

    const societyId = getSocietyIdFromLocalStorage();

    try {
      const dashboardPromise = fetch("/api/admin-dashboard", { headers });
      const finalBalancePromise =
        userRole !== "super_admin"
          ? fetch(`/api/final-balance/${societyId}`, { headers })
          : null;

      const [dashboardRes, finalBalanceRes] = await Promise.all([
        dashboardPromise,
        finalBalancePromise,
      ]);

      const dashboardJson = await dashboardRes.json();
      if (
        dashboardJson.message === "admin dashboard listed successfully" &&
        dashboardJson.data
      ) {
        setData(dashboardJson.data);
      } else {
        console.warn("Unexpected dashboard response:", dashboardJson);
      }

      if (finalBalanceRes) {
        const finalBalanceJson = await finalBalanceRes.json();
        if (
          finalBalanceJson.message === "list successful" &&
          finalBalanceJson.data
        ) {
          setFinalBalance(finalBalanceJson.data);
        } else {
          console.warn("Unexpected final balance response:", finalBalanceJson);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard/final balance:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (role === null) return null; // Avoid hydration mismatch

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
        labels: { color: "#374151" },
      },
    },
    maintainAspectRatio: false,
  };

  // Financial chart data and options
  const financialChartData = finalBalance
    ? {
        labels: [
          "Total Expense",
          "Total Maintenance",
          "Society Balance",
          "Final Balance",
        ],
        datasets: [
          {
            label: "Amount (₹)",
            data: [
              Math.abs(finalBalance.total_expense || 0),
              Math.abs(finalBalance.total_maintenance || 0),
              Math.abs(finalBalance.society_balance || 0),
              Math.abs(finalBalance.final_balance || 0),
            ],
            backgroundColor: [
              "#EF4444", // Red for expenses
              "#F59E0B", // Amber for maintenance
              "#10B981", // Green for society balance
              "#3B82F6", // Blue for final balance
            ],
            borderColor: ["#DC2626", "#D97706", "#059669", "#2563EB"],
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      }
    : null;

  const financialChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return `₹${value.toLocaleString("en-IN")}`;
          },
        },
        grid: {
          color: "#F3F4F6",
        },
      },
      x: {
        grid: {
          display: false,
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
      {/* Society Name for Admin/Member */}
      {role !== "super_admin" && data.societies_breakdown.length > 0 && (
        <div className="relative mb-14">
          <h1 className="text-4xl font-extrabold text-center text-gray-600 tracking-tight">
            {data.societies_breakdown[0].name}
          </h1>
          <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-36 h-1 rounded-full shadow-lg overflow-hidden">
            <div className="w-full h-full bg-gray-400" />
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div
        className={cn(
          "grid gap-6 mb-8",
          role === "super_admin"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
            : "grid-cols-3 justify-center place-items-center"
        )}
      >
        {role === "super_admin" && (
          <>
            <Stats
              label="Societies"
              value={data.total_societies}
              max={20}
              color="text-blue-500"
            />
            <Stats
              label="Buildings"
              value={data.total_buildings}
              max={50}
              color="text-green-500"
            />
          </>
        )}
        <Stats
          label="Flats"
          value={data.total_flats}
          max={50}
          color="text-purple-500"
        />
        <Stats
          label="Occupied"
          value={data.occupied_flats}
          max={data.total_flats || 50}
          color="text-orange-500"
        />
        <Stats
          label="Members"
          value={data.total_members}
          max={50}
          color="text-red-500"
        />
      </div>

      {/* Financial Overview Chart for non-super admin users */}
      {role !== "super_admin" && finalBalance && financialChartData && (
        <div className="p-6 rounded-2xl shadow-md space-y-6 mb-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-red-50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm text-red-700 font-medium mb-1">
                Total Expense
              </h3>
              <p className="text-2xl font-semibold text-red-900">
                ₹
                {Math.abs(finalBalance.total_expense || 0).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
            <div className="bg-amber-50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm text-amber-700 font-medium mb-1">
                Total Maintenance
              </h3>
              <p className="text-2xl font-semibold text-amber-900">
                ₹
                {Math.abs(finalBalance.total_maintenance || 0).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm text-green-700 font-medium mb-1">
                Society Balance
              </h3>
              <p className="text-2xl font-semibold text-green-900">
                ₹
                {Math.abs(finalBalance.society_balance || 0).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
            <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm text-blue-700 font-medium mb-1">
                Final Balance
              </h3>
              <p className="text-2xl font-semibold text-blue-900">
                ₹
                {Math.abs(finalBalance.final_balance || 0).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>

          {/* Financial Bar Chart */}
          <div className="h-80 rounded-xl bg-gray-50 p-4 shadow-sm">
            <Bar data={financialChartData} options={financialChartOptions} />
          </div>
        </div>
      )}

      {/* Charts + Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Flat Occupancy
          </h2>
          <div className="w-full max-w-xs mx-auto h-64">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Recent Notices
          </h2>
          <NoticesTable notices={data.recent_notices} />
        </div>
      </div>

      {/* Conditional Section */}
      {role !== "super_admin" && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            My Society Members
          </h2>
          <MembersTable members={data.members_list} />
        </div>
      )}

      {role === "super_admin" && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Society Breakdown
          </h2>
          <SocietyBreakdownTable societies={data.societies_breakdown} />
        </div>
      )}
    </motion.div>
  );
}

const Stats = ({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) => {
  const percent = max > 0 ? (value / max) * 100 : 0;
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
            strokeDasharray={`${percent * 2.51}, 251.2`}
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

const NoticesTable = ({ notices }: { notices: Notice[] }) => (
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
        {notices.length ? (
          notices.map((n) => (
            <tr key={n.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-3">{n.title}</td>
              <td className="p-3">
                {new Date(n.created_at).toLocaleDateString()}
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    n.status === "open"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {n.status}
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
);

const MembersTable = ({ members }: { members: Member[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3 text-gray-600">Name</th>
          <th className="p-3 text-gray-600">Phone</th>
        </tr>
      </thead>
      <tbody>
        {members.length ? (
          members.map((m) => (
            <tr key={m.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-3 font-medium text-gray-800">
                {m.first_name} {m.last_name}
              </td>
              <td className="p-3">{m.phone}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={2} className="p-3 text-center text-gray-500">
              No members found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const SocietyBreakdownTable = ({
  societies,
}: {
  societies: SocietyBreakdown[];
}) => (
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
        {societies.length ? (
          societies.map((s) => (
            <tr key={s.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-3 font-medium text-gray-800">{s.name}</td>
              <td className="p-3">{s.total_buildings}</td>
              <td className="p-3">{s.total_flats}</td>
              <td className="p-3">{s.total_members}</td>
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
);
