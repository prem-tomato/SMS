// app/components/polls/CreatePollModal.tsx
"use client";

import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: () => void;
  societyId: string;
  userId: string;
}

export default function CreatePollModal({
  isOpen,
  onClose,
  onPollCreated,
  societyId,
  userId,
}: CreatePollModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validOptions = options.filter((opt) => opt.trim() !== "");

      if (validOptions.length < 2) {
        alert("At least 2 options are required");
        return;
      }

      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          societyId,
          title: title.trim(),
          description: description.trim(),
          expiresAt,
          options: validOptions,
          createdBy: userId,
          userRole: "admin", // This should come from your auth context
        }),
      });

      if (response.ok) {
        onPollCreated();
        resetForm();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create poll");
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setExpiresAt("");
    setOptions(["", ""]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Create New Poll
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set up a poll for your society members
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}
        >
          {/* Poll Information Section */}
          <Typography variant="subtitle1" fontWeight="bold" color="#1e1ee4">
            Poll Information
          </Typography>

          <TextField
            label="Poll Title"
            placeholder="Enter poll title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <TextField
            label="Description (Optional)"
            placeholder="Enter poll description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <TextField
            label="Expires At"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().slice(0, 16) }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <Divider />

          {/* Poll Options Section */}
          <Typography variant="subtitle1" fontWeight="bold" color="#1e1ee4">
            Poll Options
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {options.map((option, index) => (
              <Box key={index} display="flex" alignItems="center" gap={2}>
                <TextField
                  label={`Option ${index + 1}`}
                  placeholder={`Enter option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  required
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                {options.length > 2 && (
                  <IconButton
                    onClick={() => removeOption(index)}
                    color="error"
                    size="medium"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addOption}
              variant="outlined"
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#1e1ee4",
                color: "#1e1ee4",
                "&:hover": {
                  borderColor: "#1e1ee4",
                  bgcolor: "rgba(30, 30, 228, 0.04)",
                },
              }}
            >
              Add Option
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#1e1ee4",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { bgcolor: "#1a1acc" },
            }}
          >
            {loading ? "Creating..." : "Create Poll"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
