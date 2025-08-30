// app/polls/page.tsx
"use client";

import PollsList from "@/components/polls/PollsList";
import { getLoggedInUserId, getSocietyIdFromLocalStorage } from "@/lib/auth";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

export default function PollsPage() {
  const [user, setUser] = useState<any>(null);
  const [society, setSociety] = useState<any>(null);
  const [societyId, setSocietyId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    // Get societyId from local storage
    const societyId = getSocietyIdFromLocalStorage();
    if (societyId) {
      setSocietyId(societyId);
    }

    // Get userId from local storage
    const userId = getLoggedInUserId();
    if (userId) {
      setUserId(userId);
    }

    // Get role from local storage
    const role = localStorage.getItem("role");
    if (role) {
      setRole(role);
    }

    // This should be replaced with your actual auth logic
    // For now, using placeholder data
    setUser({
      id: userId,
      role: role, // or 'member'
      societyId: societyId,
    });

    setSociety({
      id: societyId,
    });
  }, []);

  if (!user || !society) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <PollsList societyId={society.id} userId={user.id} userRole={user.role} />
  );
}
