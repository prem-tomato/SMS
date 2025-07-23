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
