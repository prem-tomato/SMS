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

export async function getVacantFlats(societyId: string, buildingId: string) {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat/vacant`,
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

export async function assignMembersToFlat(
  societyId: string,
  buildingId: string,
  flatId: string,
  payload: { user_id: string[]; move_in_date: string }
) {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat/${flatId}/assign_member`,
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
  if (!res.ok) throw new Error(json.message);
  return json;
}

export async function fetchAssignedMembers(
  societyId: string,
  buildingId: string
) {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/assigned-flats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to fetch assigned members");
  return json.data;
}

export async function listAllFlats() {
  const token = getAccessToken();
  const res = await fetch(`/api/flats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch flats");
  return json.data;
}

export async function listAllFlatsBySociety(societyId: string) {
  const token = getAccessToken();
  const res = await fetch(`/api/flats/${societyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch flats");
  return json.data;
}

export async function addFlatPenalty(
  societyId: string,
  buildingId: string,
  flatId: string,
  payload: { amount: number; reason: string }
) {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat/${flatId}/penalty`,
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
  if (!res.ok) throw new Error(json.message);
  return json;
}

export async function getParticularFlat(
  societyId: string,
  buildingId: string,
  flatId: string
) {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/building/${buildingId}/flat/${flatId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
}
