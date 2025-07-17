'use client';

import { Societies } from '@/app/api/socities/socities.types';
import { getAccessToken } from '@/lib/auth';

export const fetchSocieties = async (): Promise<Societies[]> => {
  const token = getAccessToken();
  if (!token) throw new Error("User not logged in");

  const res = await fetch("/api/socities", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch societies");
  return data.data;
};
