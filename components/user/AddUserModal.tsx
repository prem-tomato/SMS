"use client";
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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// Define the input schema (what the form receives)
const inputSchema = z.object({
  role: z.enum(["admin", "member"]),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  login_key: z.string().min(1, "Login key required"),
  phone: z.string().min(1, "Phone required"),
});

// Define the output schema (what gets sent to the API)
const outputSchema = z.object({
  role: z.enum(["admin", "member"]),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  login_key: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => val > 0, "Login key must be a positive number"),
  phone: z.string().min(1, "Phone required"),
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
  const {
    control,
    handleSubmit,
    reset,
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
    mutationFn: (data: OutputValues) =>
      createUser(societyId, {
        ...data,
        login_key: data.login_key as any, // Type assertion to bypass the type check
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", societyId] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: FormValues) => {
    // Transform the data before sending to the API
    const result = outputSchema.safeParse(data);
    if (result.success) {
      mutation.mutate(result.data);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Add New Member
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter member details below
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}
        >
          {/* Role Select */}
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  {...field}
                  label="Role"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                >
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                {errors.role && (
                  <Typography color="error" variant="caption">
                    {errors.role.message}
                  </Typography>
                )}
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
                placeholder="e.g., John"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                placeholder="e.g., Doe"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                label="Login Key"
                placeholder="e.g., 123456"
                type="number"
                error={!!errors.login_key}
                helperText={errors.login_key?.message}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}
          />

          {/* Phone */}
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Phone"
                placeholder="e.g., 9876543210"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              bgcolor: "#1e1ee4",
              px: 3,
            }}
          >
            {isSubmitting ? "Saving..." : "Save Member"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
