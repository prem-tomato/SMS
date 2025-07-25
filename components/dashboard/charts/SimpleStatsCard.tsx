interface SimpleStatsCardProps {
  label: string;
  value: number;
  max: number;
  color: string;
  loading?: boolean;
}

export const SimpleStatsCard = ({
  label,
  value,
  max,
  color,
  loading = false,
}: SimpleStatsCardProps) => {
  const colorClasses = {
    "text-blue-500": "bg-blue-500",
    "text-green-500": "bg-green-500",
    "text-purple-500": "bg-purple-500",
    "text-orange-500": "bg-orange-500",
    "text-red-500": "bg-red-500",
  };

  const bgColor =
    colorClasses[color as keyof typeof colorClasses] || "bg-gray-500";

  const textColorClass = color in colorClasses ? color : "text-gray-600";


  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-12 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <div className={`text-xl font-medium text-gray-600 mb-2 ${textColorClass}`}>{label}</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
        </>
      )}
    </div>
  );
};
