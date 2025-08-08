"use client";

import { fetchMe } from "@/services/auth";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations("ProfilePage");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

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
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {t("myProfile")}
        </Typography>
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
      </Paper>
    </Container>
  );
}
