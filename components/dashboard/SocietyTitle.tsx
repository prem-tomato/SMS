import { Building2 } from "lucide-react";

interface SocietyTitleProps {
  selectedSocietyName: string | null;
  role: string;
}

export const SocietyTitle = ({
  selectedSocietyName,
  role,
}: SocietyTitleProps) => {
  const displayName =
    selectedSocietyName ||
    (role !== "super_admin" ? "My Society Dashboard" : null);

  if (!displayName) return null;

  return (
    <div className="mb-6 text-center">
      <Building2 className="w-24 h-24 text-blue-600 mx-auto mb-4" />
      <h1 className="text-4xl font-bold text-gray-700 mb-2">{displayName}</h1>
    </div>
  );
};
