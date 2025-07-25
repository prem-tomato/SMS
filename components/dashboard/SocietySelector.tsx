"use client";

import { cn } from "@/utils/cn";
import { Building2, Check, ChevronDown, Search, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DashboardData } from "./typesOfDash";

interface SocietySelectorProps {
  data: DashboardData;
  selectedSocietyId: string | null;
  setSelectedSocietyId: (id: string | null) => void;
  className?: string;
}

export const SocietySelector = ({
  data,
  selectedSocietyId,
  setSelectedSocietyId,
  className,
}: SocietySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSociety = selectedSocietyId
    ? data.societies_breakdown.find((s) => s.id === selectedSocietyId)
    : null;

  const filteredSocieties = data.societies_breakdown.filter((society) =>
    society.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayText = selectedSociety ? selectedSociety.name : "All Societies";

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
          isOpen && "border-blue-500 ring-2 ring-blue-500"
        )}
      >
        <div className="flex items-center space-x-2">
          {selectedSociety ? (
            <Building2 className="w-4 h-4 text-blue-600" />
          ) : (
            <Users className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-900 truncate">
            {displayText}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Search Input */}
          {data.societies_breakdown.length > 5 && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search societies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {/* All Societies Option */}
            <button
              onClick={() => {
                setSelectedSocietyId(null);
                setIsOpen(false);
                setSearchTerm("");
              }}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors flex items-center justify-between",
                !selectedSocietyId && "bg-blue-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    All Societies
                  </p>
                  <p className="text-xs text-gray-500">
                    Overview of all {data.societies_breakdown.length} societies
                  </p>
                </div>
              </div>
              {!selectedSocietyId && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>

            {/* Individual Societies */}
            {filteredSocieties.length > 0 ? (
              filteredSocieties.map((society) => (
                <button
                  key={society.id}
                  onClick={() => {
                    setSelectedSocietyId(society.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors flex items-center justify-between",
                    selectedSocietyId === society.id && "bg-blue-50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {society.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {society.total_buildings}B • {society.total_flats}F •{" "}
                        {society.total_members}M
                      </p>
                    </div>
                  </div>
                  {selectedSocietyId === society.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No societies found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
