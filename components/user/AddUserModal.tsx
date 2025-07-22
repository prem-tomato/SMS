"use client";
import CommonButton from "@/components/common/CommonButton";
import { createUser } from "@/services/user";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CountryCode } from "libphonenumber-js/core";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";

// Schema
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
});

const outputSchema = inputSchema.extend({
  login_key: z.string().transform((val) => Number(val)),
});

type FormValues = z.infer<typeof inputSchema>;
type OutputValues = z.infer<typeof outputSchema>;

export default function AddUserModal({
  open,
  onClose,
  societyId,
}: {
  open: boolean;
  onClose: () => void;
  societyId: string;
}) {
  const queryClient = useQueryClient();
  const [country, setCountry] = useState<CountryCode>("IN");

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
    },
  });

  const mutation = useMutation({
    mutationFn: (data: OutputValues) => createUser(societyId, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", societyId] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.message || "Something went wrong, please try again!";

      toast.error(message);

      if (message.includes("login key")) {
        setError("login_key", { type: "manual", message });
      }
    },
  });

  const onSubmit = (data: FormValues) => {
    const result = outputSchema.safeParse(data);
    if (result.success) mutation.mutate(result.data);
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
            {/* Role */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

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

            {/* Phone Input with Country Code */}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Box>
                  <PhoneInput
                    {...field}
                    defaultCountry={country}
                    onChange={(val) => field.onChange(val)}
                    onCountryChange={(country) =>
                      setCountry(country as CountryCode)
                    }
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </>
  );
}
