"use client";

import { saveAccessToken, saveSocietyId, saveUserRole } from "@/lib/auth";
import { loginUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [login_key, setLoginKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { access_token, role, societyId } = await loginUser({
        login_key: Number(login_key),
      });
      saveUserRole(role);
      saveSocietyId(societyId);
      saveAccessToken(access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Building Stroke Icons */}
      <div className="absolute top-10 left-10 opacity-30 pointer-events-none z-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-64 h-64"
          style={{ color: "#4b4bff" }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" />
          <path d="M7 22V10h10v12" />
          <path d="M10 10h4" />
          <path d="M10 14h4" />
          <path d="M10 18h4" />
          <path d="M5 10h2" />
          <path d="M17 10h2" />
        </svg>
      </div>

      <div className="absolute bottom-10 right-10 opacity-30 pointer-events-none z-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-72 h-72"
          style={{ color: "#00c4b4" }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 21V9l8-6 8 6v12" />
          <path d="M8 21v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6" />
          <path d="M10 9h.01" />
          <path d="M14 9h.01" />
          <path d="M12 13v6" />
        </svg>
      </div>

      <div className="absolute top-1/3 left-1/3 opacity-25 pointer-events-none z-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-80 h-80"
          style={{ color: "#1e1ee4" }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 9h.01" />
          <path d="M9 12h.01" />
          <path d="M9 15h.01" />
          <path d="M15 9h.01" />
          <path d="M15 12h.01" />
          <path d="M15 15h.01" />
        </svg>
      </div>

      <div className="absolute bottom-1/4 right-1/4 opacity-25 pointer-events-none z-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-60 h-60"
          style={{ color: "#ff6f61" }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
          <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
          <path d="M10 6h.01" />
          <path d="M10 10h.01" />
          <path d="M14 6h.01" />
          <path d="M14 10h.01" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        {/* Logo Section - Matching Sidebar Theme */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-8 h-8 text-white"
              fill="currentColor"
            >
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.5L18 11h-1v6h-2v-6H9v6H7v-6H6l6-5.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Society Manager</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="login_key"
              className="block text-sm font-medium text-gray-700"
            >
              Society Key / Flat Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 5.955c-.36-.227-.696-.473-1.021-.735A2 2 0 0112 12a2 2 0 01-1.979 1.22c-.325.262-.66.508-1.021.735A6 6 0 012 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m0 0V7a2 2 0 012-2h2a2 2 0 012 2v2"
                  />
                </svg>
              </div>
              <input
                id="login_key"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={login_key}
                onChange={(e) => {
                  const val = e.target.value;
                  // Only allow digits and max 6 characters
                  if (/^\d{0,6}$/.test(val)) {
                    setLoginKey(val);
                  }
                }}
                placeholder="Enter your access key"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e1ee4] focus:border-transparent transition duration-300 bg-gray-50"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-700 text-sm font-medium">
                  {error}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-semibold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            style={{
              backgroundColor: isLoading ? "#9CA3AF" : "#1e1ee4",
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Need help accessing your account?{" "}
            <button
              type="button"
              className="text-[#1e1ee4] hover:text-[#4b4bff] font-medium hover:underline"
              onClick={() => {
                alert("Please contact your Society Admin for assistance.");
              }}
            >
              Contact Society Admin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
