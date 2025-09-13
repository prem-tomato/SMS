"use client";

import { User } from "@/app/api/auth/auth.types";
import { fetchMe } from "@/services/auth";
import { updateMe } from "@/services/me";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations("ProfilePage");
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData: Partial<User>) =>
      updateMe(user.id, updatedData as User),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: t("profileUpdated") || "Profile updated successfully!",
        severity: "success",
      });

      // Refresh the page after a short delay to show the success message
      setTimeout(() => {
        window.location.reload();
      });
    },
    onError: (error: Error) => {
      setSnackbar({
        open: true,
        message: error.message || "Failed to update profile",
        severity: "error",
      });
    },
  });

  const handleEdit = () => {
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      // Add other editable fields as needed
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography color="error">
          {(error as Error).message || "Something went wrong."}
        </Typography>
        <Button variant="contained" onClick={() => router.refresh()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="bold">
              {t("myProfile")}
            </Typography>
            {!isEditing && (
              <Button variant="outlined" onClick={handleEdit}>
                {t("edit") || "Edit"}
              </Button>
            )}
          </Box>

          {isEditing ? (
            <Stack spacing={3}>
              <TextField
                label={t("firstName") || "First Name"}
                value={editForm.first_name || ""}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
              <TextField
                label={t("lastName") || "Last Name"}
                value={editForm.last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                fullWidth
                variant="outlined"
              />
              <TextField
                label={t("phone") || "Phone"}
                value={editForm.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                fullWidth
                variant="outlined"
              />

              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  {t("cancel") || "Cancel"}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    t("save") || "Save"
                  )}
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Typography>
                <strong>{t("name")}:</strong> {user.first_name} {user.last_name}
              </Typography>
              <Typography>
                <strong>{t("role")}:</strong> {user.role}
              </Typography>
              <Typography>
                <strong>{t("loginKey")}:</strong> {user.login_key}
              </Typography>
              <Typography>
                <strong>{t("phone")}:</strong> {user.phone}
              </Typography>
              <Typography>
                <strong>{t("joinedAt")}:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
