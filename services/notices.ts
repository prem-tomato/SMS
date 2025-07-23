import { getAccessToken } from "@/lib/auth";

export async function fetchNotices(societyId: string) {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/notices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch notices");
  return json.data;
}

export async function createNotice(
  societyId: string,
  payload: { title: string; content: string }
) {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/notices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create notice");
  return json.data;
}

export async function toggleNoticeStatus(societyId: string, noticeId: string) {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/notices/${noticeId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to toggle notice status");
  return json.data;
}

export const getAllNotices = async () => {
  const token = getAccessToken();
  const res = await fetch(`/api/notices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch notices");
  return json.data;
};
