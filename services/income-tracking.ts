import { IncomeTrackingResponse } from "@/app/api/socities/socities.types";
import { getAccessToken } from "@/lib/auth";

export const fetchIncomeTracking = async (): Promise<
  IncomeTrackingResponse[]
> => {
  const token = getAccessToken();
  const res = await fetch(`/api/income-tracking`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to fetch income tracking");
  return json.data;
};

export const fetchIncomeTrackingBySocietyForAdmin = async (
  societyId: string
): Promise<IncomeTrackingResponse[]> => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/income-tracking`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to fetch income tracking");
  return json.data;
};

export const createIncomeTracking = async (
  societyId: string,
  payload: {
    income_type: string;
    income_reason: string;
    income_amount: number;
    income_month: number;
    income_year: number;
  }
) => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/income-tracking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to create income tracking");
  return json;
};
