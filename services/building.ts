import { getAccessToken } from "@/lib/auth";

export async function fetchBuildings() {
  const token = getAccessToken();
  const res = await fetch("/api/buildings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch buildings");
  return json.data;
}

export async function createBuilding(payload: { society_id: string; name: string; total_floors: number }) {
  const token = getAccessToken();
  const res = await fetch('/api/buildings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create building');
  return json;
}

export async function fetchBuildingsBySociety(societyId: string) {
  const token = getAccessToken();
  const res = await fetch(`/api/buildings/options/${societyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch buildings');
  return json.data;
}
