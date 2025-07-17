'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth";
import { saveAccessToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [login_key, setLoginKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { access_token } = await loginUser({ login_key: Number(login_key) });
      saveAccessToken(access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-24 p-6 bg-white shadow rounded-xl text-black">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Login Key"
          value={login_key}
          onChange={(e) => setLoginKey(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
