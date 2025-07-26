import { LoginsResponse } from "@/app/api/logins/logins.controller";
import { getAccessToken } from "@/lib/auth";

export const getLoginHistoryService = async (): Promise<LoginsResponse[]> => {
  const token = getAccessToken(); // replace with your auth helper
  const res = await fetch("/api/logins", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch logins");
  return json.data;
};

export const getLoginHistoryServiceBySocietyId = async (
  societyId: string
): Promise<LoginsResponse[]> => {
  const token = getAccessToken(); // replace with your auth helper
  const res = await fetch(`/api/logins/${societyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch logins");
  return json.data;
};
