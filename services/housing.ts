import {
  AddHousingUnitReqBody,
  AssignHousingUnitReqBody,
  UpdateHousingUnitReqBody,
} from "@/app/api/socities/socities.types";
import { getAccessToken } from "@/lib/auth";

export const createHousingUnit = async (
  societyId: string,
  payload: AddHousingUnitReqBody
) => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/housing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create housing unit");
  return json;
};

export const fetchAllHousingUnits = async () => {
  const token = getAccessToken();
  const res = await fetch(`/api/housing-units`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch housing units");
  return json.data;
};

export const getHousingUnitsOptions = async () => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/options/housing`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch housing units");
  return json.data;
};

export const getHousingUnitsBySocietyId = async (societyId: string) => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/housing/options`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch housing units");
  return json.data;
};

export const assignHousingUnitService = async (
  societyId: string,
  housingId: string,
  payload: AssignHousingUnitReqBody
) => {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/housing/${housingId}/assign-unit`,
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
  if (!res.ok) throw new Error(json.message || "Failed to assign housing unit");
  return json;
};

export const getVacantHousingUnits = async (societyId: string) => {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/housing/getVacantHousing`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to fetch vacant housing units");
  return json.data;
};

export const getOccupiedHousingUnits = async (societyId: string) => {
  const token = getAccessToken();
  const res = await fetch(
    `/api/socities/${societyId}/housing/get-occupied-housing`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Failed to fetch occupied housing units");
  return json.data;
};

export const updateHousingUnit = async (
  societyId: string,
  housingId: string,
  payload: UpdateHousingUnitReqBody
) => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/housing/${housingId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update housing unit");
  return json;
};

export const deleteHousingUnitService = async (
  societyId: string,
  housingId: string
) => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/housing/${housingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete housing unit");
  return json;
};

export const getHousingUnitsBySocietyIdService = async (societyId: string) => {
  const token = getAccessToken();
  const res = await fetch(`/api/socities/${societyId}/housing`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch housing units");
  return json.data;
};
