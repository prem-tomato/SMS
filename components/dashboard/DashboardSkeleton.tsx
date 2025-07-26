"use client";

import { CircularProgress } from "@mui/material";

export const DashboardSkeleton = () => (
  <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden px-4">
    <CircularProgress size={48} thickness={4} />
    <div className="text-center mt-6 max-w-md">
      <h1 className="text-4xl font-bold text-gray-700 mb-2">
        Loading Dashboard...
      </h1>
    </div>
  </div>
);
