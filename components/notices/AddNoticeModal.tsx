"use client";

import { getUserRole } from "@/lib/auth";
import { createNotice } from "@/services/notices";
import { fetchSocietyOptions } from "@/services/societies";
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
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import CommonButton from "../common/CommonButton";

const schema = z.object({
  title: z.string().min(1, "Title required"),
  content: z.string().min(1, "Content required"),
  society_id: z.string().min(1, "Society is required"),
});

type FormValues = z.infer<typeof schema>;

export default function AddNoticeModal({
  open,
  onClose,
  societyId: adminSocietyId,
}: {
  open: boolean;
  onClose: () => void;
  societyId: string; // for admin
}) {
  const qc = useQueryClient();
  const [role, setRole] = useState<string>("");

  // Get role from localStorage
  useEffect(() => {
    const storedRole = getUserRole();
    setRole(storedRole!);
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      society_id: "",
    },
  });

  // Fetch societies for super admin
  const { data: societies = [] } = useQuery({
    queryKey: ["society-options"],
    queryFn: fetchSocietyOptions,
    enabled: !!adminSocietyId || role === "super_admin",
  });

  // Auto set society_id for admins
  useEffect(() => {
    if (role === "admin" || (role === "member" && adminSocietyId)) {
      setValue("society_id", adminSocietyId);
    }
  }, [role, adminSocietyId, setValue]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => createNotice(data.society_id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notices", adminSocietyId] });
      reset();
      onClose();
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          New Notice
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter notice title and content below
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}
        >
          {/* Society Dropdown for Super Admins */}
          {role !== "super_admin" && adminSocietyId && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
          {role === "super_admin" && (
            <Controller
              name="society_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Select Society</InputLabel>
                  <Select
                    {...field}
                    label="Select Society"
                    error={!!errors.society_id}
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
                    {societies.map((society: any) => (
                      <MenuItem key={society.id} value={society.id}>
                        {society.name}
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

          {/* Title */}
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                placeholder="e.g., Water Supply Disruption"
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}
          />

          {/* Content */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Content"
                placeholder="Describe the notice details here..."
                multiline
                rows={4}
                error={!!errors.content}
                helperText={errors.content?.message}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={onClose}
            disabled={mutation.isPending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <CommonButton
            type="submit"
            variant="contained"
            loading={mutation.isPending}
            sx={{ bgcolor: "#1e1ee4" }}
          >
            Save Notice
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
