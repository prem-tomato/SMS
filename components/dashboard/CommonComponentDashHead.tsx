"use client";

import { SocietySelector } from "./SocietySelector";
import { DashboardData } from "./typesOfDash";

interface CompactDashboardHeaderProps {
  role: string;
  data: DashboardData;
  selectedSocietyId: string | null;
  setSelectedSocietyId: (id: string | null) => void;
  loading: boolean;
}

export const CompactDashboardHeader = ({
  role,
  data,
  selectedSocietyId,
  setSelectedSocietyId,
  loading,
}: CompactDashboardHeaderProps) => {
  if (role !== "super_admin" || data.societies_breakdown.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Society Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and monitor your societies
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            )}

            <SocietySelector
              data={data}
              selectedSocietyId={selectedSocietyId}
              setSelectedSocietyId={setSelectedSocietyId}
              className="min-w-[250px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
