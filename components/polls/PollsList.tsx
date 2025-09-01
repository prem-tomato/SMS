// app/components/polls/PollsList.tsx
"use client";

import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import CommonDataGrid from "../common/CommonDataGrid"; // Adjust import path as needed
import CreatePollModal from "./CreatePollModal";

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
  percentage: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  expires_at: string;
  status: "active" | "expired" | "closed";
  created_at: string;
  user_has_voted: boolean;
  user_voted_option_id?: string;
  total_votes: number;
  options?: PollOption[];
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
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

  const handleViewPoll = (poll: Poll) => {
    setSelectedPoll(poll);
    setShowDetailModal(true);
  };

  const handleVoteOption = async (optionId: string) => {
    if (!selectedPoll) return;

    try {
      const response = await fetch(`/api/polls/${selectedPoll.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pollId: selectedPoll.id,
          optionId: optionId,
          userId: userId,
        }),
      });

      if (response.ok) {
        handleVote(); // Refresh the polls data
        setShowDetailModal(false); // Close modal after voting
      } else {
        console.error("Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
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

  const columns = [
    {
      field: "title",
      headerName: "Poll Title",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      renderCell: ({ row }: { row: Poll }) => (
        <span title={row.description}>
          {row.description || "No Description"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: ({ row }: { row: Poll }) => {
        const isActive = row.status === "active";
        const isExpired = row.status === "expired";

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: isActive ? "#10b981" : isExpired ? "#ef4444" : "#6b7280",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: isActive
                  ? "#10b981"
                  : isExpired
                  ? "#ef4444"
                  : "#6b7280",
                transition: "background-color 0.2s",
              }}
            />
            <span>
              {isActive ? "Active" : isExpired ? "Expired" : row.status}
            </span>
          </div>
        );
      },
    },
    {
      field: "expires_at",
      headerName: "Expires At",
      flex: 1,
      renderCell: ({ row }: { row: Poll }) =>
        row.expires_at
          ? dayjs(row.expires_at).format("YYYY-MM-DD HH:mm")
          : "No Expiry",
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: ({ row }: { row: Poll }) =>
        dayjs(row.created_at).format("YYYY-MM-DD HH:mm"),
    },
    {
      field: "total_votes",
      headerName: "Total Votes",
      flex: 0.6,
      renderCell: ({ row }: { row: Poll }) => (
        <span style={{ fontWeight: 500 }}>{row.total_votes || 0}</span>
      ),
    },
    {
      field: "user_has_voted",
      headerName: "Your Vote",
      flex: 0.8,
      renderCell: ({ row }: { row: Poll }) => {
        const hasVoted = row.user_has_voted;
        const votedOption = row.options?.find(
          (opt) => opt.id === row.user_voted_option_id
        );

        return (
          <div style={{ fontSize: "0.875rem" }}>
            {hasVoted ? (
              <span
                style={{
                  color: "#10b981",
                  fontWeight: 500,
                  backgroundColor: "#f0fdf4",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  border: "1px solid #bbf7d0",
                }}
              >
                {votedOption?.option_text || "Voted"}
              </span>
            ) : (
              <span
                style={{
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                Not Voted
              </span>
            )}
          </div>
        );
      },
    },
    {
      field: "options",
      headerName: "Results",
      flex: 1,
      renderCell: ({ row }: { row: Poll }) => {
        const sortedOptions =
          row.options?.sort((a, b) => b.vote_count - a.vote_count) || [];
        const topOption = sortedOptions[0];

        return (
          <div style={{ fontSize: "0.75rem", lineHeight: "1.2" }}>
            {sortedOptions.length > 0 ? (
              <div>
                <div style={{ fontWeight: 500, color: "#374151" }}>
                  {topOption?.option_text}: {topOption?.percentage}% (
                  {topOption?.vote_count})
                </div>
                {sortedOptions.length > 1 && (
                  <div style={{ color: "#6b7280", marginTop: "2px" }}>
                    +{sortedOptions.length - 1} more options
                  </div>
                )}
              </div>
            ) : (
              <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                No Options
              </span>
            )}
          </div>
        );
      },
    },
    {
      field: "view",
      headerName: "View",
      flex: 0.5,
      renderCell: ({ row }: { row: Poll }) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleViewPoll(row)}
          sx={{
            textTransform: "none",
            borderColor: "#1e1ee4",
            color: "#1e1ee4",
            fontSize: "0.75rem",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            "&:hover": {
              borderColor: "#1a1acc",
              bgcolor: "rgba(30, 30, 228, 0.04)",
            },
          }}
        >
          View
        </Button>
      ),
    },
  ];

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
    <Box height="calc(100vh - 180px)">
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {userRole === "admin" && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
              sx={{
                borderRadius: 1,
                border: "1px solid #1e1ee4",
                color: "#1e1ee4",
              }}
            >
              Create Poll
            </Button>
          )}
        </Box>

        {/* Filter Buttons */}
        <Box>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            sx={{
              "& .MuiToggleButton-root": {
                borderRadius: 1,
                border: "1px solid #1e1ee4",
                color: "#1e1ee4",
                px: 2,
                py: 1,
                mb: 2,
                "&.Mui-selected": {
                  backgroundColor: "#1e1ee4",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1a1acc",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(30, 30, 228, 0.04)",
                },
              },
            }}
          >
            <ToggleButton value="active">
              ACTIVE POLLS (
              {
                polls.filter(
                  (p) =>
                    p.status === "active" && new Date(p.expires_at) > new Date()
                ).length
              }
              )
            </ToggleButton>
            <ToggleButton value="expired">
              EXPIRED POLLS (
              {
                polls.filter(
                  (p) =>
                    p.status === "expired" ||
                    new Date(p.expires_at) <= new Date()
                ).length
              }
              )
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      {/* Polls Table */}
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
        <CommonDataGrid
          rows={filteredPolls}
          columns={columns}
          loading={loading}
          height="calc(100vh - 170px)"
          pageSize={20}
        />
      )}

      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPollCreated={handlePollCreated}
        societyId={societyId}
        userId={userId}
      />

      {/* Poll Detail Modal - Inline Component */}
      <Dialog
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold">
            Poll Details
          </Typography>
          <IconButton onClick={() => setShowDetailModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selectedPoll && (
            <Stack spacing={3}>
              {/* Poll Title */}
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="#333"
                  sx={{ mb: 1 }}
                >
                  {selectedPoll.title}
                </Typography>
                {selectedPoll.description && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedPoll.description}
                  </Typography>
                )}
              </Box>

              {/* Status and Info */}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  label={
                    selectedPoll.status === "expired" ||
                    new Date(selectedPoll.expires_at) <= new Date()
                      ? "Expired"
                      : "Active"
                  }
                  color={
                    selectedPoll.status === "expired" ||
                    new Date(selectedPoll.expires_at) <= new Date()
                      ? "error"
                      : "success"
                  }
                  variant="filled"
                  size="small"
                />
                <Chip
                  label={`${selectedPoll.total_votes} votes`}
                  variant="outlined"
                  size="small"
                />
                {selectedPoll.user_has_voted && (
                  <Chip
                    label="You voted"
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>

              {/* Dates */}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Created:</strong>{" "}
                  {dayjs(selectedPoll.created_at).format(
                    "MMMM DD, YYYY at HH:mm"
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Expires:</strong>{" "}
                  {dayjs(selectedPoll.expires_at).format(
                    "MMMM DD, YYYY at HH:mm"
                  )}
                </Typography>
              </Box>

              <Divider />

              {/* Options */}
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  {selectedPoll.user_has_voted ||
                  selectedPoll.status === "expired" ||
                  new Date(selectedPoll.expires_at) <= new Date()
                    ? "Results"
                    : "Vote for an Option"}
                </Typography>

                <Stack spacing={2}>
                  {selectedPoll.options
                    ?.sort((a, b) => b.vote_count - a.vote_count)
                    .map((option, index) => {
                      const isUserChoice =
                        option.id === selectedPoll.user_voted_option_id;
                      const isExpired =
                        selectedPoll.status === "expired" ||
                        new Date(selectedPoll.expires_at) <= new Date();
                      const canVote =
                        !selectedPoll.user_has_voted && !isExpired;
                      const showResults =
                        selectedPoll.user_has_voted || isExpired;

                      return (
                        <Paper
                          key={option.id}
                          elevation={1}
                          sx={{
                            p: 2,
                            border: isUserChoice
                              ? "2px solid #1e1ee4"
                              : "1px solid #e0e0e0",
                            borderRadius: 2,
                            bgcolor: isUserChoice
                              ? "rgba(30, 30, 228, 0.05)"
                              : "white",
                            cursor: canVote ? "pointer" : "default",
                            transition: "all 0.2s ease",
                            "&:hover": canVote
                              ? {
                                  bgcolor: "rgba(30, 30, 228, 0.02)",
                                  borderColor: "#1e1ee4",
                                  boxShadow: "0 2px 8px rgba(30, 30, 228, 0.1)",
                                }
                              : {},
                          }}
                          onClick={() => canVote && handleVoteOption(option.id)}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: showResults ? 1 : 0 }}
                          >
                            <Typography
                              variant="body1"
                              fontWeight={isUserChoice ? 600 : 500}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {showResults && index === 0 && (
                                <Chip
                                  label="Leading"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem", height: "20px" }}
                                />
                              )}
                              {option.option_text}
                              {isUserChoice && (
                                <Chip
                                  label="Your vote"
                                  size="small"
                                  color="primary"
                                  variant="filled"
                                  sx={{ fontSize: "0.7rem", height: "20px" }}
                                />
                              )}
                              {canVote && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#1e1ee4",
                                    fontSize: "0.75rem",
                                    fontStyle: "italic",
                                    ml: 1,
                                  }}
                                >
                                  Click to vote
                                </Typography>
                              )}
                            </Typography>

                            {showResults && (
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={
                                  index === 0 ? "#10b981" : "text.secondary"
                                }
                              >
                                {option.percentage}% ({option.vote_count})
                              </Typography>
                            )}
                          </Stack>

                          {showResults && (
                            <LinearProgress
                              variant="determinate"
                              value={option.percentage}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "#f0f0f0",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor:
                                    index === 0
                                      ? "#10b981"
                                      : isUserChoice
                                      ? "#1e1ee4"
                                      : "#94a3b8",
                                  borderRadius: 3,
                                },
                              }}
                            />
                          )}

                          {canVote && (
                            <Box
                              sx={{
                                mt: 1,
                                pt: 1,
                                borderTop: "1px dashed #e0e0e0",
                              }}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVoteOption(option.id);
                                }}
                                sx={{
                                  bgcolor: "#1e1ee4",
                                  textTransform: "none",
                                  borderRadius: 1.5,
                                  py: 0.8,
                                  "&:hover": {
                                    bgcolor: "#1a1acc",
                                  },
                                }}
                              >
                                Vote for this option
                              </Button>
                            </Box>
                          )}
                        </Paper>
                      );
                    })}
                </Stack>
              </Box>

              {/* Action Button */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                sx={{ pt: 2 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setShowDetailModal(false)}
                  sx={{
                    textTransform: "none",
                    borderColor: "#e0e0e0",
                    color: "#666",
                    "&:hover": {
                      borderColor: "#1e1ee4",
                      bgcolor: "rgba(30, 30, 228, 0.04)",
                    },
                  }}
                >
                  Close
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
