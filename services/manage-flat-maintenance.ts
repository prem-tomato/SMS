import { getAccessToken } from "@/lib/auth";

export async function manageFlatMaintenance(
  flatMaintenanceId: string, // ← This is the ID of the maintenance record, not flat
  payload: any
): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`/api/flat-maintenance/${flatMaintenanceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to manage flat maintenance");
  }
}

export async function getFlatMaintenanceDetails(
  societyId: string,
  buildingId: string,
  flatId: string
): Promise<any> {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat/${flatId}/manage-maintenance`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to get flat maintenance details");
  }
  return json;
}

export async function markMonthlyMaintenanceAsPaid(
  monthlyMaintenanceId: string,
  flatMaintenanceId: string
): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(
    `/api/flat-maintenance/${flatMaintenanceId}/monthly-maintenance/${monthlyMaintenanceId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.message || "Failed to mark monthly maintenance as paid"
    );
  }
}

export async function markSettlementAsPaid(
  settlementId: string,
  flatMaintenanceId: string
): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(
    `/api/flat-maintenance/${flatMaintenanceId}/settlements/${settlementId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to mark settlement as paid");
  }
}

export async function getDuesYearMonth() {
  const token = getAccessToken();
  const res = await fetch("/api/dues-year-month", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to get dues year month");
  }

  return json.data.month_year;
}
