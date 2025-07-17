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
