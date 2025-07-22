"use client";
import { getAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const accessToken = getAccessToken();

  useEffect(() => {
    if (accessToken) {
      router.push("/dashboard");
    } else {
      router.push("auth/login");
    }
  }, [router]);

  return null;
}
