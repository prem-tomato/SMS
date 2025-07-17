'use client';

import { getAccessToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '../api/auth/auth.types';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return router.push('/auth/login');

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(res => {
        if (res.data) setUser(res.data);
      });
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Welcome {user.first_name}</h1>
      <p>Role: {user.role}</p>
    </div>
  );
}
