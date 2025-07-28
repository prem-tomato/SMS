import { getAccessToken } from "@/lib/auth";

export const getMembersMonthlyDues = async (monthYear: string) => {
  const token = getAccessToken();
  const response = await fetch(
    `/api/member-monthly-dues?monthYear=${monthYear}`,
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

export const getMembersMonthlyDuesForAdmin = async (
  societyId: string,
  monthYear: string
) => {
  const token = getAccessToken();
  const response = await fetch(
    `/api/member-monthly-dues/${societyId}?monthYear=${monthYear}`,
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

// export const updateMemberMonthlyDues = async (
//   flatId: string,
//   maintenancePaid: boolean,
//   penaltyPaid: boolean
// )

export const updateMemberMonthlyDues = async (
  societyId: string,
  buildingId: string,
  flatId: string,
  recordId: string,
  payload: { maintenance_paid?: boolean; penalty_paid?: boolean }
): Promise<void> => {
  const token = getAccessToken();
  const response = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat/${flatId}/monetize-dues/${recordId}/edit`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Failed to update dues");
};

export const getMemberMonthlyDueRecord = async (recordId: string) => {
  const token = getAccessToken();
  const response = await fetch(`/api/member-monthly-dues/view/${recordId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Failed to fetch dues");
  return json.data;
};
