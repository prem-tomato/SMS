import { getAccessToken } from "@/lib/auth";

export async function fetchFlats(societyId: string, buildingId: string) {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch flats");
  return json.data;
}

export async function createFlat(
  societyId: string,
  buildingId: string,
  payload: { flat_number: string; floor_number: number }
) {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create flat");
  return json;
}
