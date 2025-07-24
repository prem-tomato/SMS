"use client";

import CommonButton from "@/components/common/CommonButton";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import { fetchSocietyOptions } from "@/services/societies";
import { createUser } from "@/services/user";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CountryCode } from "libphonenumber-js/core";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";

const inputSchema = z.object({
  role: z.enum(["admin", "member"]),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  login_key: z
    .string()
    .min(1, "Login key required")
    .regex(/^\d+$/, "Login key must be digits")
    .refine((val) => val.length <= 6, "Max 6 digits"),
  phone: z
    .string()
    .min(1, "Phone required")
    .refine((val) => isValidPhoneNumber(val), "Invalid phone number"),
  society_id: z.string().optional(),
});

// Create a schema for super_admin that requires society_id
const superAdminSchema = inputSchema.extend({
  society_id: z.string().min(1, "Society is required"),
});

type FormValues = z.infer<typeof inputSchema>;
type SuperAdminFormValues = z.infer<typeof superAdminSchema>;

export default function AddUserModal({
  open,
  onClose,
  societyId,
}: {
  open: boolean;
  onClose: () => void;
  societyId?: string;
}) {
  const queryClient = useQueryClient();
  const [country, setCountry] = useState<CountryCode>("IN");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminSocietyId, setAdminSocietyId] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      role: "member",
      first_name: "",
      last_name: "",
      login_key: "",
      phone: "",
      society_id: "",
    },
  });

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);

    if (role === "admin") {
      const societyId = getSocietyIdFromLocalStorage();
      if (societyId) setAdminSocietyId(societyId);
    }
  }, []);

  const { data: societies = [] } = useQuery({
    queryKey: ["society-options"],
    queryFn: fetchSocietyOptions,
    enabled: userRole === "super_admin" || userRole === "admin",
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Validate based on user role
      let validatedData;
      if (userRole === "super_admin") {
        const result = superAdminSchema.safeParse(data);
        if (!result.success) {
          // Handle validation errors
          result.error.issues.forEach((issue) => {
            const path = issue.path[0] as keyof FormValues;
            setError(path, { type: "manual", message: issue.message });
          });
          throw new Error("Validation failed");
        }
        validatedData = result.data;
      } else {
        validatedData = data;
      }

      const targetSocietyId =
        userRole === "super_admin" ? validatedData.society_id! : adminSocietyId;

      // Transform login_key to number
      const submitData = {
        ...validatedData,
        login_key: Number(validatedData.login_key),
      };

      return createUser(targetSocietyId, submitData as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      if (error.message === "Validation failed") return; // Already handled

      const message =
        error?.message || "Something went wrong, please try again!";
      toast.error(message);
      if (message.includes("login key")) {
        setError("login_key", { type: "manual", message });
      }
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Add New Member
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter member details below
          </Typography>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {userRole === "admin" && adminSocietyId && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Society
                </Typography>
                <Chip
                  label={
                    societies.find((s: any) => s.id === adminSocietyId)?.name ||
                    "Selected Society"
                  }
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}

            {/* Role */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    {...field}
                    label="Role"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          "& .MuiMenuItem-root": {
                            fontSize: "0.875rem",
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Society - dropdown for super_admin, chip for admin */}
            {userRole === "super_admin" && (
              <Controller
                name="society_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.society_id}>
                    <InputLabel>Society</InputLabel>
                    <Select
                      {...field}
                      label="Society"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            "& .MuiMenuItem-root": {
                              fontSize: "0.875rem",
                            },
                          },
                        },
                      }}
                    >
                      {societies.map((s: any) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.society_id && (
                      <Typography variant="caption" color="error">
                        {errors.society_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            {/* First Name */}
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  fullWidth
                />
              )}
            />

            {/* Last Name */}
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  fullWidth
                />
              )}
            />

            {/* Login Key */}
            <Controller
              name="login_key"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Login Key (max 6 digits)"
                  inputProps={{ maxLength: 6 }}
                  error={!!errors.login_key}
                  helperText={errors.login_key?.message}
                  fullWidth
                />
              )}
            />

            {/* Phone Input */}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Box>
                  <PhoneInput
                    {...field}
                    defaultCountry={country}
                    onChange={(val) => field.onChange(val)}
                    onCountryChange={(c) => setCountry(c as CountryCode)}
                    international
                    countryCallingCodeEditable={false}
                    className="phone-input"
                  />
                  {errors.phone && (
                    <Typography variant="caption" color="error">
                      {errors.phone.message}
                    </Typography>
                  )}
                </Box>
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={onClose}>Cancel</Button>
            <CommonButton
              type="submit"
              variant="contained"
              loading={mutation.isPending}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              Save Member
            </CommonButton>
          </DialogActions>
        </Box>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
