"use client";

import { FinancialChart } from "@/components/dashboard/charts/FinancialChart";
import { OccupancyChart } from "@/components/dashboard/charts/OccupancyChart";
import { SimpleStatsCard } from "@/components/dashboard/charts/SimpleStatsCard";
import { SocietyStatsChart } from "@/components/dashboard/charts/SocietyStatsChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { FinancialCard } from "@/components/dashboard/FinancialCard";
import { MembersTable } from "@/components/dashboard/MembersTable";
import { NoticesTable } from "@/components/dashboard/NoticesTable";
import { SocietyBreakdownTable } from "@/components/dashboard/SocietyBreakdownTable";
import { SocietyTitle } from "@/components/dashboard/SocietyTitle";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import {
  DashboardData,
  FinalBalanceData,
  SocietySpecificData,
} from "@/components/dashboard/typesOfDash";
import {
  getAccessToken,
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
  getUserRole,
} from "@/lib/auth";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";

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
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | null>(
    null
  );
  const [societySpecificData, setSocietySpecificData] =
    useState<SocietySpecificData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [societyType, setSocietyType] = useState<string | null>(null);

  // API Functions (keeping the same logic)
  async function fetchGeneralData() {
    const userRole = getUserRole();
    setRole(userRole);
    const societyType = getSocietyTypeFromLocalStorage();
    setSocietyType(societyType);
    const headers = {
      Authorization: `Bearer ${getAccessToken()}`,
    };

    try {
      const dashboardRes = await fetch("/api/admin-dashboard", { headers });
      const dashboardJson = await dashboardRes.json();
      if (
        dashboardJson.message === "admin dashboard listed successfully" &&
        dashboardJson.data
      ) {
        setData(dashboardJson.data);
      }
    } catch (error) {
      console.error("Error fetching general dashboard data:", error);
    }
  }

  async function fetchSocietySpecificData(societyId: string) {
    if (!societyId) return;
    setLoading(true);
    const headers = {
      Authorization: `Bearer ${getAccessToken()}`,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const societyDashboardRes = await fetch(
        `/api/admin-dashboard/${societyId}`,
        { headers }
      );
      const finalBalanceRes = await fetch(`/api/final-balance/${societyId}`, {
        headers,
      });

      const [societyDashboardJson, finalBalanceJson] = await Promise.all([
        societyDashboardRes.json(),
        finalBalanceRes.json(),
      ]);

      const societyData: SocietySpecificData = {
        total_buildings: 0,
        total_flats: 0,
        occupied_flats: 0,
        total_members: 0,
        recent_notices: [],
        members_list: [],
        final_balance: null,
      };

      if (
        societyDashboardJson.message ===
          "admin dashboard listed successfully" &&
        societyDashboardJson.data
      ) {
        societyData.total_buildings =
          societyDashboardJson.data.total_buildings || 0;
        societyData.total_flats = societyDashboardJson.data.total_flats || 0;
        societyData.occupied_flats =
          societyDashboardJson.data.occupied_flats || 0;
        societyData.total_members =
          societyDashboardJson.data.total_members || 0;
        societyData.recent_notices =
          societyDashboardJson.data.recent_notices || [];
        societyData.members_list = societyDashboardJson.data.members_list || [];
      }

      if (
        finalBalanceJson.message === "list successful" &&
        finalBalanceJson.data
      ) {
        societyData.final_balance = finalBalanceJson.data;
      }

      setSocietySpecificData(societyData);
    } catch (error) {
      console.error("Error fetching society-specific data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData() {
    const userRole = getUserRole();
    setRole(userRole);
    if (userRole === "super_admin") {
      await fetchGeneralData();
    } else {
      const societyId = getSocietyIdFromLocalStorage();
      await fetchGeneralData();
      if (societyId) {
        setSelectedSocietyId(societyId);
        await fetchSocietySpecificData(societyId);
      }
    }
    setInitialLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSocietyId && role === "super_admin") {
      fetchSocietySpecificData(selectedSocietyId);
    }
  }, [selectedSocietyId]);

  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  if (role === null) return null;

  // Use society-specific data if available, otherwise use general data
  const displayData = societySpecificData || {
    total_buildings: data.total_buildings,
    total_flats: data.total_flats,
    occupied_flats: data.occupied_flats,
    total_members: data.total_members,
    recent_notices: data.recent_notices,
    members_list: data.members_list,
    final_balance: finalBalance,
  };

  const selectedSocietyName = selectedSocietyId
    ? data.societies_breakdown.find((s) => s.id === selectedSocietyId)?.name ||
      "Selected Society"
    : role !== "super_admin" && data.societies_breakdown.length > 0
    ? data.societies_breakdown[0].name
    : null;

  return (
    <Box height="calc(100vh - 180px)">
      <div className="min-h-screen bg-gray-50 p-6">
        <DashboardHeader
          role={role}
          data={data}
          selectedSocietyId={selectedSocietyId}
          setSelectedSocietyId={setSelectedSocietyId}
          loading={loading}
        />

        {role !== "super_admin" && (
          <div className="relative mb-8 flex flex-col items-center text-center group">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent rounded-2xl blur-xl scale-110 opacity-60"></div>

            {/* Main content container */}
            <div className="relative space-y-4">
              {/* Society Title */}
              <div>
                <SocietyTitle
                  selectedSocietyName={selectedSocietyName}
                  role={role}
                />
              </div>

              {/* Modern chip with glass morphism effect */}
              <div className="inline-flex items-center">
                <div className="relative overflow-hidden">
                  <div
                    className=" px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase
                    backdrop-blur-sm border transition-all duration-300 bg-blue-50/80 border-blue-200/60 text-blue-700 hover:bg-blue-100/80 hover:border-blue-300/80"
                  >
                    {/* Icon indicator */}
                    <span className="inline-flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      {societyType === "commercial"
                        ? "Commercial"
                        : "residential"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div key={selectedSocietyId || "default"}>
          {/* Conditional Content Based on Selection */}
          {role === "super_admin" && !selectedSocietyId ? (
            // Show overall statistics for super admin when no society is selected
            <>
              <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                <SimpleStatsCard
                  label="Societies"
                  value={data.total_societies}
                  max={20}
                  color="text-blue-500"
                />
                <SimpleStatsCard
                  label="Buildings"
                  value={data.total_buildings}
                  max={50}
                  color="text-green-500"
                />
                <SimpleStatsCard
                  label="Flats"
                  value={data.total_flats}
                  max={200}
                  color="text-purple-500"
                />
                <SimpleStatsCard
                  label="Occupied"
                  value={data.occupied_flats}
                  max={data.total_flats || 200}
                  color="text-orange-500"
                />
                <SimpleStatsCard
                  label="Members"
                  value={data.total_members}
                  max={200}
                  color="text-red-500"
                />
              </div>

              {/* Society Breakdown Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Society Statistics
                </h2>
                <SocietyStatsChart societies={data.societies_breakdown} />
              </div>

              {/* Society Breakdown Table */}
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Society Breakdown
                </h2>
                <SocietyBreakdownTable societies={data.societies_breakdown} />
              </div>
            </>
          ) : (
            // Show society-specific data when a society is selected or for non-super admin
            <>
              {/* Stats Section */}
              <div
                className={
                  "grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }
              >
                {role && (
                  <SimpleStatsCard
                    label="Buildings"
                    value={loading ? 0 : displayData.total_buildings}
                    max={50}
                    color="text-green-500"
                    loading={loading}
                  />
                )}
                <SimpleStatsCard
                  label="Flats"
                  value={loading ? 0 : displayData.total_flats}
                  max={50}
                  color="text-purple-500"
                  loading={loading}
                />
                <SimpleStatsCard
                  label="Occupied"
                  value={loading ? 0 : displayData.occupied_flats}
                  max={displayData.total_flats || 50}
                  color="text-orange-500"
                  loading={loading}
                />
                <SimpleStatsCard
                  label="Members"
                  value={loading ? 0 : displayData.total_members}
                  max={50}
                  color="text-red-500"
                  loading={loading}
                />
              </div>

              {/* Financial Overview */}
              {!loading && displayData.final_balance && (
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Financial Overview
                  </h2>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <FinancialCard
                      title="Total Expense"
                      value={Math.abs(
                        displayData.final_balance.total_expense || 0
                      )}
                      color="red"
                    />
                    <FinancialCard
                      title="Collected Amount"
                      value={Math.abs(
                        displayData.final_balance.total_maintenance || 0
                      )}
                      color="amber"
                    />
                    <FinancialCard
                      title="Opening Balance"
                      value={Math.abs(
                        displayData.final_balance.society_balance || 0
                      )}
                      color="green"
                    />
                    <FinancialCard
                      title="Available Balance"
                      value={Math.abs(
                        displayData.final_balance.final_balance || 0
                      )}
                      color="blue"
                    />
                  </div>

                  {/* Financial Chart */}
                  <FinancialChart data={displayData.final_balance} />
                </div>
              )}

              {/* Charts + Notices */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Flat Occupancy
                  </h2>
                  {loading ? (
                    <div className="flex items-center justify-center h-80">
                      <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                  ) : (
                    <OccupancyChart
                      occupied={displayData.occupied_flats}
                      total={displayData.total_flats}
                    />
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Recent Notices
                  </h2>
                  {loading ? (
                    <TableSkeleton rows={5} columns={3} />
                  ) : (
                    <NoticesTable notices={displayData.recent_notices} />
                  )}
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {role === "super_admin"
                    ? "Society Members"
                    : "My Society Members"}
                </h2>
                {loading ? (
                  <TableSkeleton rows={8} columns={2} />
                ) : (
                  <MembersTable members={displayData.members_list} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Box>
  );
}
