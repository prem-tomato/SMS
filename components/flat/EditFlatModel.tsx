"use client";

import CommonButton from "@/components/common/CommonButton";
import { updateFlat } from "@/services/flats";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  flat_number: z.string().min(1, "Flat number is required"),
  floor_number: z.string().min(1, "Floor number is required"),
  square_foot: z.string().min(1, "Square foot is required"),
  current_maintenance: z.string().min(1, "Current maintenance is required"),
  pending_maintenance: z
    .array(
      z.object({
        amount: z.union([z.string(), z.number()]).optional(),
        reason: z.string().optional(),
      })
    )
    .optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditFlatModal({
  open,
  onClose,
  flat,
}: {
  open: boolean;
  onClose: () => void;
  flat: any;
}) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      flat_number: "",
      floor_number: "",
      square_foot: "",
      current_maintenance: "",
      pending_maintenance: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pending_maintenance",
  });

  // Reset with existing flat data when modal opens
  useEffect(() => {
    if (open && flat) {
      reset({
        flat_number: flat.flat_number || "",
        floor_number: String(flat.floor_number || ""),
        square_foot: String(flat.square_foot || ""),
        current_maintenance: String(flat.current_maintenance || ""),
        pending_maintenance: flat.pending_maintenance || [
          { amount: 0, reason: "" },
        ],
      });
    }
  }, [open, flat, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      updateFlat(flat.society_id, flat.building_id, flat.id, {
        flat_number: data.flat_number,
        floor_number: Number(data.floor_number),
        square_foot: Number(data.square_foot),
        current_maintenance: Number(data.current_maintenance),
        pending_maintenance: (data.pending_maintenance ?? []).map((p) => ({
          amount: Number(p.amount) || 0,
          reason: p.reason ?? "",
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["flats"] as any);
      onClose();
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update flat");
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Flat</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Controller
            name="flat_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Flat No"
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
                label="Floor"
                error={!!errors.floor_number}
                helperText={errors.floor_number?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="square_foot"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Square Foot"
                error={!!errors.square_foot}
                helperText={errors.square_foot?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="current_maintenance"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Current Maintenance"
                error={!!errors.current_maintenance}
                helperText={errors.current_maintenance?.message}
                fullWidth
              />
            )}
          />

          {/* Pending Maintenance Fields */}
          <Typography variant="subtitle2">Pending Maintenance</Typography>
          {fields.map((field, index) => (
            <Box key={field.id} display="flex" gap={2}>
              <Controller
                name={`pending_maintenance.${index}.amount`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Amount"
                    type="number"
                    fullWidth
                  />
                )}
              />
              <Controller
                name={`pending_maintenance.${index}.reason`}
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Reason" fullWidth />
                )}
              />
              {fields.length > 1 && (
                <IconButton onClick={() => remove(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button onClick={() => append({ amount: 0, reason: "" })}>
            + Add Entry
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <CommonButton
            type="submit"
            variant="contained"
            loading={mutation.isPending}
          >
            Update Flat
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
