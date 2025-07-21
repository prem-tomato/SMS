"use client";

import CommonButton from "@/components/common/CommonButton";
import { fetchBuildingById } from "@/services/building";
import { createFlat } from "@/services/flats";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

export default function AddFlatModal({
  open,
  onClose,
  societyId,
  buildingId,
}: {
  open: boolean;
  onClose: () => void;
  societyId: string;
  buildingId: string;
}) {
  const queryClient = useQueryClient();

  // ✅ Get total floors from API
  const { data: buildingDetails } = useQuery({
    queryKey: ["buildingDetails", buildingId],
    queryFn: () => fetchBuildingById(societyId, buildingId),
    enabled: !!buildingId,
  });

  const totalFloors = buildingDetails?.total_floors ?? 0;

  // ✅ State for backend errors
  const [backendError, setBackendError] = useState<string | null>(null);

  // ✅ Zod schema depends on totalFloors
  const schema = z.object({
    flat_number: z.string().min(1, "Flat number is required"),
    floor_number: z.string().refine(
      (val) => {
        const num = Number(val);
        return num >= 0 && num <= totalFloors;
      },
      {
        message: `Floor must be between 0 and ${totalFloors}`,
      }
    ),
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { flat_number: "", floor_number: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: { flat_number: string; floor_number: number }) =>
      createFlat(societyId, buildingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["flats", societyId, buildingId],
      });
      reset();
      setBackendError(null);
      onClose();
    },
    onError: async (error: any) => {
      const res = await error?.response?.json?.();
      if (res?.message?.includes("Floor number")) {
        setError("floor_number", {
          type: "manual",
          message: res.message,
        });
      } else if (res?.message) {
        setBackendError(res.message);
      } else {
        setBackendError("Something went wrong!");
      }
    },
  });

  const onSubmit = (data: any) => {
    setBackendError(null);
    mutation.mutate({
      flat_number: data.flat_number,
      floor_number: Number(data.floor_number),
    });
  };

  // ✅ Reset form on open/close
  useEffect(() => {
    if (!open) {
      reset();
      setBackendError(null);
    }
  }, [open, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Add New Flat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter flat details below
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Controller
            name="flat_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Flat Number"
                placeholder="e.g., 101"
                error={!!errors.flat_number}
                helperText={errors.flat_number?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="floor_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={`Floor Number (0-${totalFloors})`}
                placeholder={`Max: ${totalFloors}`}
                type="number"
                error={!!errors.floor_number}
                helperText={errors.floor_number?.message}
                fullWidth
              />
            )}
          />

          {backendError && (
            <Typography variant="body2" color="error">
              {backendError}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <CommonButton
            type="submit"
            variant="contained"
            loading={mutation.isPending}
            sx={{ bgcolor: "#1e1ee4" }}
          >
            Save Flat
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
