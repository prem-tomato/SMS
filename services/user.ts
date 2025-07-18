import { getAccessToken } from "@/lib/auth";

export async function fetchUsersBySociety(societyId: string) {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch users");
  return json.data;
}

export async function fetchVacantUsersBySociety(societyId: string) {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/user/vacant-member`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch users");
  return json.data;
}

export async function createUser(
  societyId: string,
  payload: {
    role: "admin" | "member";
    first_name: string;
    last_name: string;
    login_key: string;
    phone: string;
  }
) {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create user");
  return json;
}
