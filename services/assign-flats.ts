import { getAccessToken } from "@/lib/auth";

export const assignMemberListForSuperAdmin = async () => {
  const token = getAccessToken();
  const res = await fetch(`/api/assigned-members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch users");
  return json.data;
};

export const assignMemberListForAdmin = async (societyId: string) => {
  const token = getAccessToken();
  const res = await fetch(`/api/assigned-members/${societyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch users");
  return json.data;
};

export const deleteAssignMemberService = async (
  societyId: string,
  buildingId: string,
  flatId: string,
  assignMemberId: string
) => {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat/${flatId}/assign_member/${assignMemberId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete user");
  return json.data;
};

export const deleteAssignUnitService = async (
  societyId: string,
  housingId: string,
  assignUnitId: string
) => {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/housing/${housingId}/assign-unit/${assignUnitId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete user");
  return json.data;
};
