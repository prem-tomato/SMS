"use client";

import { Societies } from "@/app/api/socities/socities.types";
import { getAccessToken } from "@/lib/auth";

export const fetchSocieties = async (): Promise<Societies[]> => {
  const token = getAccessToken();

  const res = await fetch("/api/socities", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch societies");
  return data.data;
};

export const createSociety = async (payload: {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}): Promise<Societies> => {
  const token = getAccessToken();

  const res = await fetch("/api/socities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create society");
  return data.data;
};

export async function fetchSocietyOptions() {
  const token = getAccessToken();

  const res = await fetch("/api/socities/options", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch societies");
  return json.data as { id: string; name: string }[];
}

export async function fetchSocietyOptionsForFlat() {
  const token = getAccessToken();

  const res = await fetch("/api/socities/options/flats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch societies");
  return json.data as { id: string; name: string }[];
}

// services/societies.ts
export const setEndDateFunc = async ({
  id,
  end_date,
}: {
  id: string;
  end_date: string;
}) => {
  const token = getAccessToken();

  const res = await fetch(`/api/socities/${id}/end-date`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ end_date }),
  });
  if (!res.ok) throw new Error("Failed to update end date");
  return res.json();
};

export const deleteSociety = async (id: string): Promise<void> => {
  const token = getAccessToken();

  const res = await fetch(`/api/socities/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete society");
  return res.json();
};

export const softDeleteSociety = async (societyId: string): Promise<void> => {
  const token = getAccessToken();

  const res = await fetch(`/api/socities/${societyId}/delete-society`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to soft delete society");
  return res.json();
};
