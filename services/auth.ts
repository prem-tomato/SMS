"use client";

import { LoginBody, LoginResponse } from "@/app/api/auth/auth.types";
import { getAccessToken } from "@/lib/auth";

// Updated loginUser service function
export const loginUser = async (body: LoginBody): Promise<LoginResponse> => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Login failed");

  return data.data;
};

export async function fetchMe() {
  const token = getAccessToken(); // replace with your auth helper
  const res = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch user profile");
  return json.data;
}
