interface StatsProps {
  label: string
  value: number
  max: number
  color: string
  loading?: boolean
}

export const Statsss = ({ label, value, max, color, loading = false }: StatsProps) => {
  const percent = max > 0 ? (value / max) * 100 : 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36 mb-4">
        {loading ? (
          <div className="w-full h-full rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={color}
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              strokeDasharray={`${percent * 2.51}, 251.2`}
              strokeLinecap="round"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dy=".3em"
              className="text-2xl font-bold fill-current transform rotate-90"
              style={{ transformOrigin: "50px 50px" }}
            >
              {value}
            </text>
          </svg>
        )}
      </div>
      <p className="text-lg font-semibold text-gray-700">{label}</p>
    </div>
  )
}
