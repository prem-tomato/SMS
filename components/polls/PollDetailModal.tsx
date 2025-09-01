// app/components/polls/PollDetailModal.tsx
"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import dayjs from "dayjs";

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

interface PollDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: Poll | null;
  userId: string;
  onVote: () => void;
}

export default function PollDetailModal({
  isOpen,
  onClose,
  poll,
  userId,
  onVote,
}: PollDetailModalProps) {
  if (!poll) return null;

  const isExpired = poll.status === "expired" || new Date(poll.expires_at) <= new Date();
  const userVotedOption = poll.options?.find(opt => opt.id === poll.user_voted_option_id);

  const handleVoteOption = async (optionId: string) => {
    try {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollId: poll.id,
          optionId: optionId,
          userId: userId,
        }),
      });

      if (response.ok) {
        onVote();
        onClose();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Poll Title */}
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#333" sx={{ mb: 1 }}>
              {poll.title}
            </Typography>
            {poll.description && (
              <Typography variant="body2" color="text.secondary">
                {poll.description}
              </Typography>
            )}
          </Box>

          {/* Status and Info */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label={isExpired ? "Expired" : "Active"}
              color={isExpired ? "error" : "success"}
              variant="filled"
              size="small"
            />
            <Chip
              label={`${poll.total_votes} votes`}
              variant="outlined"
              size="small"
            />
            {poll.user_has_voted && (
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
              <strong>Created:</strong> {dayjs(poll.created_at).format("MMMM DD, YYYY at HH:mm")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Expires:</strong> {dayjs(poll.expires_at).format("MMMM DD, YYYY at HH:mm")}
            </Typography>
          </Box>

          <Divider />

          {/* Options */}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              {poll.user_has_voted || isExpired ? "Results" : "Vote Options"}
            </Typography>
            
            <Stack spacing={2}>
              {poll.options?.sort((a, b) => b.vote_count - a.vote_count).map((option, index) => {
                const isUserChoice = option.id === poll.user_voted_option_id;
                const canVote = !poll.user_has_voted && !isExpired;
                
                return (
                  <Paper
                    key={option.id}
                    elevation={1}
                    sx={{
                      p: 2,
                      border: isUserChoice ? "2px solid #1e1ee4" : "1px solid #e0e0e0",
                      borderRadius: 2,
                      bgcolor: isUserChoice ? "rgba(30, 30, 228, 0.05)" : "white",
                      cursor: canVote ? "pointer" : "default",
                      transition: "all 0.2s ease",
                      "&:hover": canVote ? {
                        bgcolor: "rgba(30, 30, 228, 0.02)",
                        borderColor: "#1e1ee4",
                      } : {},
                    }}
                    onClick={() => canVote && handleVoteOption(option.id)}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography
                        variant="body1"
                        fontWeight={isUserChoice ? 600 : 500}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {index === 0 && (poll.user_has_voted || isExpired) && (
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
                      </Typography>
                      
                      {(poll.user_has_voted || isExpired) && (
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={index === 0 ? "#10b981" : "text.secondary"}
                        >
                          {option.percentage}% ({option.vote_count})
                        </Typography>
                      )}
                    </Stack>
                    
                    {(poll.user_has_voted || isExpired) && (
                      <LinearProgress
                        variant="determinate"
                        value={option.percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#f0f0f0",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: index === 0 ? "#10b981" : 
                                   isUserChoice ? "#1e1ee4" : "#94a3b8",
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                  </Paper>
                );
              })}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
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
      </DialogContent>
    </Dialog>
  );
}