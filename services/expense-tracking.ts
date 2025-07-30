import {
  AddExpenseTrackingReqBody,
  ExpenseTrackingResponse,
} from "@/app/api/socities/socities.types";
import { getAccessToken } from "@/lib/auth";

export const fetchExpenseTracking = async (): Promise<
  ExpenseTrackingResponse[]
> => {
  const token = getAccessToken();
  const res = await fetch(`/api/expense-tracking`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to fetch expense tracking");
  return json.data;
};

export const fetchExpenseTrackingBySocietyForAdmin = async (
  societyId: string
): Promise<ExpenseTrackingResponse[]> => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/expense-tracking`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to fetch expense tracking");
  return json.data;
};

export const createExpenseTracking = async (
  societyId: string,
  payload: {
    expense_type: string;
    expense_reason: string;
    expense_amount: number;
    expense_month: number;
    expense_year: number;
  }
) => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/expense-tracking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to create expense tracking");
  return json;
};
