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
