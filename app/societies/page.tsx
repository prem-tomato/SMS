'use client';

import { Societies } from '@/app/api/socities/socities.types';
import { fetchSocieties } from '@/services/societies';
import { useEffect, useState } from 'react';

export default function SocietiesPage() {
  const [societies, setSocieties] = useState<Societies[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSocieties().then(setSocieties).catch(err => setError(err.message));
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Societies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {societies.map(society => (
          <div key={society.id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{society.name}</h2>
            <p>{society.address}, {society.city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
