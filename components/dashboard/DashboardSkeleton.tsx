import { CircularProgress } from "@mui/material";

export const DashboardSkeleton = () => (
  <div className="min-h-screen mb-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <CircularProgress size={48} thickness={4} />
  </div>
);
