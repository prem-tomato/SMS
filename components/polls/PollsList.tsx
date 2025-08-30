// app/components/polls/PollsList.tsx
"use client";

import { Add as AddIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import CreatePollModal from "./CreatePollModal";
import PollCard from "./PollCard";

interface Poll {
  id: string;
  title: string;
  description?: string;
  expires_at: string;
  status: "active" | "expired" | "closed";
  user_has_voted: boolean;
  user_voted_option_id?: string;
  total_votes: number;
}

interface PollsListProps {
  societyId: string;
  userId: string;
  userRole: string;
}

export default function PollsList({
  societyId,
  userId,
  userRole,
}: PollsListProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"active" | "expired">("active");

  const fetchPolls = async () => {
    try {
      const response = await fetch(
        `/api/polls?societyId=${societyId}&userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setPolls(data);
      } else {
        console.error("Failed to fetch polls");
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [societyId, userId]);

  const handlePollCreated = () => {
    fetchPolls();
  };

  const handleVote = () => {
    fetchPolls();
  };

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: "active" | "expired" | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredPolls = polls.filter((poll) => {
    if (filter === "active")
      return poll.status === "active" && new Date(poll.expires_at) > new Date();
    if (filter === "expired")
      return (
        poll.status === "expired" || new Date(poll.expires_at) <= new Date()
      );
    return true;
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={40} sx={{ color: "#1e1ee4" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "1200px", mx: "auto" }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1"
            fontWeight="bold" 
            color="#333" 
            sx={{ 
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2.125rem" }
            }}
          >
            Polls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === "active"
              ? "Active polls you can vote on"
              : "Expired polls and results"}
          </Typography>
        </Box>

        {userRole === "admin" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateModal(true)}
            sx={{
              bgcolor: "#1e1ee4",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              minWidth: "140px",
              boxShadow: "0 2px 8px rgba(30, 30, 228, 0.3)",
              "&:hover": { 
                bgcolor: "#1a1acc",
                boxShadow: "0 4px 12px rgba(30, 30, 228, 0.4)",
              },
            }}
          >
            Create Poll
          </Button>
        )}
      </Stack>

      {/* Filter Buttons */}
      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            "& .MuiToggleButton-root": {
              textTransform: "none",
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: 1.2,
              border: "1px solid #e0e0e0",
              color: "#666",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&.Mui-selected": {
                bgcolor: "#1e1ee4",
                color: "white",
                borderColor: "#1e1ee4",
                boxShadow: "0 2px 4px rgba(30, 30, 228, 0.2)",
                "&:hover": {
                  bgcolor: "#1a1acc",
                },
              },
              "&:hover": {
                bgcolor: "rgba(30, 30, 228, 0.04)",
                borderColor: "#1e1ee4",
              },
            },
          }}
        >
          <ToggleButton value="active">
            Active Polls ({
              polls.filter(
                (p) =>
                  p.status === "active" && new Date(p.expires_at) > new Date()
              ).length
            })
          </ToggleButton>
          <ToggleButton value="expired">
            Expired Polls ({
              polls.filter(
                (p) =>
                  p.status === "expired" || new Date(p.expires_at) <= new Date()
              ).length
            })
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Polls Container */}
      {filteredPolls.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            bgcolor: "#f8f9fa",
            borderRadius: 3,
            border: "1px solid #e0e0e0",
            background: "linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)",
          }}
        >
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 2, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            No {filter} polls found
          </Typography>
          {userRole === "admin" && filter === "active" && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first poll to get started
            </Typography>
          )}
          {userRole === "admin" && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
              sx={{
                textTransform: "none",
                borderColor: "#1e1ee4",
                color: "#1e1ee4",
                borderRadius: 2,
                px: 3,
                py: 1.5,
                "&:hover": {
                  borderColor: "#1e1ee4",
                  bgcolor: "rgba(30, 30, 228, 0.04)",
                },
              }}
            >
              Create First Poll
            </Button>
          )}
        </Paper>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            // Alternative: masonry-style layout for larger screens
            "@media (min-width: 900px)": {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              "& > *": {
                flex: "1 1 calc(50% - 12px)",
                minWidth: "350px",
              },
            },
          }}
        >
          {filteredPolls.map((poll) => (
            <Box key={poll.id} sx={{ width: "100%" }}>
              <PollCard
                poll={poll}
                userId={userId}
                onVote={handleVote}
                showResults={poll.user_has_voted || filter === "expired"}
              />
            </Box>
          ))}
        </Box>
      )}

      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPollCreated={handlePollCreated}
        societyId={societyId}
        userId={userId}
      />
    </Box>
  );
}