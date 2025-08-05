import { AddHousingUnitPenaltyReqBody } from "@/app/api/socities/socities.types";
import { getAccessToken } from "@/lib/auth";

export const addPenaltyForUnit = async (
  societyId: string,
  housingUnitId: string,
  reqBody: AddHousingUnitPenaltyReqBody
): Promise<void> => {
  const token = await getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/housing/${housingUnitId}/penalty`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reqBody),
    }
  );
  if (!res.ok) {
    throw new Error(`Error adding penalty: ${res.statusText}`);
  }
};

export const listPenaltiesForUnit = async (
  societyId: string,
  housingUnitId: string
) => {
  const token = await getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/housing/${housingUnitId}/penalty/list`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Error listing penalties: ${res.statusText}`);
  }
  return res.json();
};

export const removePenaltyForUnit = async (
  societyId: string,
  housingUnitId: string,
  penaltyId: string
): Promise<void> => {
  const token = await getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/housing/${housingUnitId}/penalty/${penaltyId}/deleted`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }
  );
  if (!res.ok) {
    throw new Error(`Error removing penalty: ${res.statusText}`);
  }
};

export const updatePenaltyForUnit = async (
  societyId: string,
  housingUnitId: string,
  penaltyId: string
): Promise<void> => {
  const token = await getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/housing/${housingUnitId}/penalty/${penaltyId}/paid`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }
  );
  if (!res.ok) {
    throw new Error(`Error updating penalty: ${res.statusText}`);
  }
};
