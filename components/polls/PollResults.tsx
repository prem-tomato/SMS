// app/components/polls/PollResults.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Clock } from 'lucide-react';

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
  percentage: number;
}

interface PollResultsData {
  id: string;
  title: string;
  description?: string;
  expires_at: string;
  status: string;
  created_at: string;
  options: PollOption[];
  total_votes: number;
}

interface PollResultsProps {
  pollId: string;
}

export default function PollResults({ pollId }: PollResultsProps) {
  const [pollData, setPollData] = useState<PollResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPollResults = async () => {
      try {
        const response = await fetch(`/api/polls/${pollId}/results`);
        if (response.ok) {
          const data = await response.json();
          setPollData(data);
        } else {
          console.error('Failed to fetch poll results');
        }
      } catch (error) {
        console.error('Error fetching poll results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPollResults();
  }, [pollId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pollData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Poll not found</p>
      </div>
    );
  }

  const chartData = pollData.options.map(option => ({
    name: option.option_text.length > 20 ? 
      option.option_text.substring(0, 20) + '...' : 
      option.option_text,
    votes: option.vote_count,
    percentage: option.percentage
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{pollData.title}</h2>
        {pollData.description && (
          <p className="text-gray-600 mb-4">{pollData.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{pollData.total_votes} total votes</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>Expires: {new Date(pollData.expires_at).toLocaleString()}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            pollData.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {pollData.status}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Vote Distribution</h3>
          <div className="space-y-3">
            {pollData.options.map((option) => (
              <div key={option.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{option.option_text}</span>
                  <span className="text-sm text-gray-600">
                    {option.vote_count} ({option.percentage}%)
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 rounded-full h-3 transition-all duration-300"
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Chart View</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Votes']}
                labelFormatter={(label) => `Option: ${label}`}
              />
              <Bar dataKey="votes" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

