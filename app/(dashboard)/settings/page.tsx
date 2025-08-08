"use client";

import { AddRazorPayConfig } from "@/app/api/socities/socities.types";
import CommonButton from "@/components/common/CommonButton";
import {
  addRazorPayConfigService,
  getRazorPayConfigService,
} from "@/services/razor-pay-config";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fade,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function RazorPayConfigPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [formData, setFormData] = useState<AddRazorPayConfig>({
    razorpay_key_id: "",
    razorpay_key_secret: "",
  });

  // Fetch existing config
  const {
    data: configResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["razorpay-config"],
    queryFn: getRazorPayConfigService,
  });

  const config = configResponse?.data?.[0] || null;

  // Prefill form if config exists
  useEffect(() => {
    if (config) {
      setFormData({
        razorpay_key_id: config.razorpay_key_id,
        razorpay_key_secret: config.razorpay_key_secret || "",
      });
    }
  }, [config]);

  // Mutation to add/update config
  const mutation = useMutation({
    mutationFn: addRazorPayConfigService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["razorpay-config"] });
      setEditing(false);
      setShowSecret(false);
    },
  });

  const handleEdit = () => {
    setEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleCancel = () => {
    setEditing(false);
    setShowSecret(false);
    if (config) {
      setFormData({
        razorpay_key_id: config.razorpay_key_id,
        razorpay_key_secret: config.razorpay_key_secret || "",
      });
    }
  };

  const maskKey = (key: string) => {
    if (!key) return "Not configured";
    return key.slice(0, 8) + "••••••••••••" + key.slice(-4);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #1976d2",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
          <Typography color="text.secondary">
            Loading configuration...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load RazorPay configuration. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "white",
              border: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://play-lh.googleusercontent.com/2BQu8Y7Ah9Gh9CZvmaMSYIcZvdO4KfdJ26EZ1WGyaOG_xxeDxNn-AZYxOtQJvyQQPFY"
              alt="RazorPay"
              style={{
                width: 32,
                height: 32,
                objectFit: "contain",
              }}
            />
          </Box>
          <Typography variant="h4" fontWeight="600" color="text.primary">
            Payment Configuration
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Manage your RazorPay integration settings
        </Typography>
      </Stack>

      {/* Status Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: config
            ? "linear-gradient(135deg, #e8f5e8 0%, #f0fdf4 100%)"
            : "linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" fontWeight="500">
              Integration Status
            </Typography>
            <Chip
              label={config ? "Active" : "Not Configured"}
              color={config ? "success" : "error"}
              variant="filled"
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Stack>
          {config && (
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date(config.updated_at).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Configuration Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {!editing ? (
            // View Mode
            <Box sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" fontWeight="500">
                    API Credentials
                  </Typography>
                  <CommonButton
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{ textTransform: "uppercase", bgcolor: "#1e1ee4" }}
                  >
                    {config ? "Update Keys" : "Configure"}
                  </CommonButton>
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Key ID
                    </Typography>
                    <Typography
                      variant="body1"
                      fontFamily="monospace"
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      {config
                        ? maskKey(config.razorpay_key_id)
                        : "Not configured"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Secret Key
                    </Typography>
                    <Typography
                      variant="body1"
                      fontFamily="monospace"
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      {config ? "••••••••••••••••••••••••" : "Not configured"}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          ) : (
            // Edit Mode
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight="500">
                  {config
                    ? "Update API Credentials"
                    : "Configure API Credentials"}
                </Typography>

                <TextField
                  name="razorpay_key_id"
                  label="RazorPay Key ID"
                  value={formData.razorpay_key_id}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="rzp_test_1234567890"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  name="razorpay_key_secret"
                  label="RazorPay Key Secret"
                  type={showSecret ? "text" : "password"}
                  value={formData.razorpay_key_secret}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your secret key"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowSecret(!showSecret)}
                          edge="end"
                          size="small"
                        >
                          {showSecret ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <CommonButton
                    type="submit"
                    variant="contained"
                    loading={mutation.isPending}
                    loadingPosition="start"
                    startIcon={<SaveIcon />}
                    sx={{ textTransform: "uppercase", bgcolor: "#1e1ee4" }}
                  >
                    {mutation.isPending ? "Saving..." : "Save Changes"}
                  </CommonButton>
                  <Button
                    onClick={handleCancel}
                    disabled={mutation.isPending}
                    sx={{ textTransform: "uppercase", color: "#1e1ee4" }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Feedback Messages */}
      <Fade in={mutation.isError}>
        <Box sx={{ mt: 3 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Failed to save configuration. Please check your credentials and try
            again.
          </Alert>
        </Box>
      </Fade>

      {/* Help Text */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: "grey.50",
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1 }}>
          Need help?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You can find your RazorPay credentials in your{" "}
          <Typography component="span" color="#1e1ee4" fontWeight="500" sx={{ textDecoration: "underline" }}>
            <a href="https://dashboard.razorpay.com/app/website-app-settings/api-keys" target="_blank">
              RazorPay Dashboard
            </a>
          </Typography>{" "}
          under API Keys section. Make sure to use test keys for development and
          live keys for production.
        </Typography>
      </Paper>
    </Box>
  );
}
