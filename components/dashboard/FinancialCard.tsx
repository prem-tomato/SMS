interface FinancialCardProps {
  title: string
  value: number
  color: string
}

export const FinancialCard = ({ title, value, color }: FinancialCardProps) => {
  const colorClasses = {
    red: "border-red-200 bg-red-50",
    amber: "border-amber-200 bg-amber-50",
    green: "border-green-200 bg-green-50",
    blue: "border-blue-200 bg-blue-50",
  }

  const textColorClasses = {
    red: "text-red-700",
    amber: "text-amber-700",
    green: "text-green-700",
    blue: "text-blue-700",
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className={`text-2xl font-bold ${textColorClasses[color as keyof typeof textColorClasses]}`}>
        ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  )
}
