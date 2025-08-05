"use client";

import { cn } from "@/utils/cn";
import { Building2, Building2Icon, ChevronDown, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DashboardData } from "./typesOfDash";

interface DashboardHeaderProps {
  role: string;
  data: DashboardData;
  selectedSocietyId: string | null;
  setSelectedSocietyId: (id: string | null) => void;
  loading: boolean;
}

export const DashboardHeader = ({
  role,
  data,
  selectedSocietyId,
  setSelectedSocietyId,
  loading,
}: DashboardHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (role !== "super_admin" || data.societies_breakdown.length === 0) {
    return null;
  }

  const selectedSociety = selectedSocietyId
    ? data.societies_breakdown.find((s) => s.id === selectedSocietyId)
    : null;

  const displayText = selectedSociety
    ? selectedSociety.name
    : "All Societies Overview";

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">
            <div className="flex gap-4 items-center">

            <Building2Icon className="w-8 h-8 text-blue-600" />Dashboard
            </div>
          </h2>

          {/* Society Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex items-center justify-between min-w-[280px] px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                isOpen && "border-blue-500 ring-2 ring-blue-500"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {selectedSociety ? (
                    <Building2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Users className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {displayText}
                    </p>
                  {selectedSociety && (
                    <p className="text-xs text-gray-500">
                      {selectedSociety.total_buildings} buildings •{" "}
                      {selectedSociety.total_units} flats
                    </p>
                  )}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-gray-400 transition-transform",
                  isOpen && "transform rotate-180"
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {/* All Societies Option */}
                <button
                  onClick={() => {
                    setSelectedSocietyId(null);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors border-b border-gray-100",
                    !selectedSocietyId && "bg-blue-50 border-blue-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        All Societies Overview
                      </p>
                      <p className="text-xs text-gray-500">
                        View all {data.societies_breakdown.length} societies
                      </p>
                    </div>
                  </div>
                </button>

                {/* Individual Societies */}
                {data.societies_breakdown.map((society) => (
                  <button
                    key={society.id}
                    onClick={() => {
                      setSelectedSocietyId(society.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors",
                      selectedSocietyId === society.id && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {society.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {society.total_buildings} buildings •{" "}
                          {society.total_units} flats • {society.total_members}{" "}
                          members
                        </p>
                      </div>
                      {selectedSocietyId === society.id && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
