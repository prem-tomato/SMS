import { User } from "@/app/api/auth/auth.types";
import { getAccessToken } from "@/lib/auth";

export async function updateMe(userId: string, reqBody: User) {
  const token = getAccessToken();
  const res = await fetch(`/api/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reqBody),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update user");
  return json;
}
