// app/components/polls/PollCard.tsx
"use client";

import { CheckCircle, Clock, Users } from "lucide-react";
import { useState } from "react";

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  vote_count?: number;
  percentage?: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  expires_at: string;
  status: "active" | "expired" | "closed";
  user_has_voted: boolean;
  user_voted_option_id?: string;
  total_votes: number;
  options?: PollOption[];
}

interface PollCardProps {
  poll: Poll;
  userId: string;
  onVote: () => void;
  showResults?: boolean;
}

export default function PollCard({
  poll,
  userId,
  onVote,
  showResults = false,
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [voting, setVoting] = useState(false);

  const isExpired =
    new Date(poll.expires_at) <= new Date() || poll.status !== "active";
  const canVote = !poll.user_has_voted && !isExpired;

  const handleVote = async () => {
    if (!selectedOption) {
      alert("Please select an option");
      return;
    }

    setVoting(true);
    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: selectedOption,
          userId,
        }),
      });

      if (response.ok) {
        onVote();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote");
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{poll.title}</h3>
        {poll.description && (
          <p className="text-gray-600 text-sm mb-3">{poll.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>Expires: {formatDate(poll.expires_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{poll.total_votes} votes</span>
          </div>
          {poll.user_has_voted && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle size={16} />
              <span>Voted</span>
            </div>
          )}
        </div>
      </div>

      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm font-medium">
            This poll has expired
          </p>
        </div>
      )}

      {poll.user_has_voted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-600 text-sm font-medium">
            You have already voted on this poll
          </p>
        </div>
      )}

      <div className="space-y-3">
        {poll.options?.map((option) => (
          <div key={option.id} className="relative">
            {canVote && !showResults ? (
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`poll-${poll.id}`}
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{option.option_text}</span>
              </label>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {poll.user_voted_option_id === option.id && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                  <span className="text-sm">{option.option_text}</span>
                </div>
                {(showResults || poll.user_has_voted || isExpired) && (
                  <div className="text-sm text-gray-600">
                    {option.vote_count || 0} votes ({option.percentage || 0}%)
                  </div>
                )}
              </div>
            )}

            {(showResults || poll.user_has_voted || isExpired) && (
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${option.percentage || 0}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {canVote && !showResults && (
        <button
          onClick={handleVote}
          disabled={!selectedOption || voting}
          className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {voting ? "Voting..." : "Submit Vote"}
        </button>
      )}
    </div>
  );
}
