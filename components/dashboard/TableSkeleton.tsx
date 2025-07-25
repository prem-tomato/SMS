interface TableSkeletonProps {
  rows: number
  columns: number
}

export const TableSkeleton = ({ rows, columns }: TableSkeletonProps) => (
  <div className="space-y-3">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    ))}
  </div>
)
