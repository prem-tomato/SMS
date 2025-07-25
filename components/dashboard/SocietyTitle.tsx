interface SocietyTitleProps {
  selectedSocietyName: string | null
  role: string
}

export const SocietyTitle = ({ selectedSocietyName, role }: SocietyTitleProps) => {
  const displayName = selectedSocietyName || (role !== "super_admin" ? "My Society Dashboard" : null)

  if (!displayName) return null

  return (
    <div className="mb-12 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{displayName}</h1>
      <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
    </div>
  )
}
