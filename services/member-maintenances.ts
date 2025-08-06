import { GetMemberMaintenance } from "@/app/api/member-maintenances/member-maintenances.types";
import { getAccessToken } from "@/lib/auth";

export const getMemberMaintenances = async (
  societyId: string,
  monthYear: string
): Promise<GetMemberMaintenance[]> => {
  const token = getAccessToken();
  const response = await fetch(
    `/api/member-maintenances/${societyId}/?monthYear=${monthYear}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Failed to fetch dues");
  return json.data;
};
