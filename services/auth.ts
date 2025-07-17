"use client";

import { LoginBody, LoginResponse } from "@/app/api/auth/auth.types";

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
