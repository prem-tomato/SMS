// components/flat/EditFlatModal.tsx
"use client";

import CommonButton from "@/components/common/CommonButton";
import { fetchFlatMaintenance, updateFlat } from "@/services/flats";
import { zodResolver } from "@hookform/resolvers/zod";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
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
        id: z.string().optional(),
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
  flat: any | null;
}) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      flat_number: "",
      floor_number: "",
      square_foot: "",
      current_maintenance: "",
      pending_maintenance: [{ amount: "", reason: "" }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "pending_maintenance",
  });

  // Fetch maintenance for the flat when modal opens
  const {
    data: maintenanceDataRaw,
    isLoading: maintenanceLoading,
    isError: maintenanceError,
  } = useQuery({
    queryKey: ["flat-maintenance", flat?.id],
    queryFn: async () => {
      if (!flat) return [];
      return await fetchFlatMaintenance(
        flat.society_id,
        flat.building_id,
        flat.id
      );
    },
    enabled: !!flat?.id && open,
    retry: false,
  });

  // Normalize maintenance list robustly so we never try to map a non-array
  const maintenanceList = useMemo(() => {
    // If response is already an array (common case) use it
    if (Array.isArray(maintenanceDataRaw)) return maintenanceDataRaw;
    // If service returned { data: [...] } use that
    if (maintenanceDataRaw && Array.isArray((maintenanceDataRaw as any).data))
      return (maintenanceDataRaw as any).data;
    // fallback to flat.pending_maintenance (if backend included it) or empty array
    if (flat?.pending_maintenance && Array.isArray(flat.pending_maintenance))
      return flat.pending_maintenance;
    return [];
  }, [maintenanceDataRaw, flat]);

  // Reset form values when modal opens or when maintenanceList becomes available
  useEffect(() => {
    if (!open) return;
    if (!flat) {
      // if modal opened but no flat selected, clear form
      reset({
        flat_number: "",
        floor_number: "",
        square_foot: "",
        current_maintenance: "",
        pending_maintenance: [{ amount: "", reason: "" }],
      });
      return;
    }

    // Map maintenance entries to string fields for the inputs
    const pm = maintenanceList.map((p: any) => ({
      id: p.id,
      amount: p.amount != null ? String(p.amount) : "",
      reason: p.reason ?? "",
    }));

    reset({
      flat_number: flat.flat_number ?? "",
      floor_number: String(flat.floor_number ?? ""),
      square_foot: String(flat.square_foot ?? ""),
      current_maintenance: String(flat.current_maintenance ?? ""),
      // if no previous maintenance, show one empty row
      pending_maintenance: pm.length ? pm : [{ amount: "", reason: "" }],
    });

    // Replace RHF field array with fetched values (keeps correct internal ids)
    if (pm.length) replace(pm as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flat, maintenanceList, reset, replace]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!flat) throw new Error("No flat selected");
      // Build maintenance payload:
      // - existing entries (have id) => include (will be updated)
      // - new entries (no id) => only include if amount>0 or reason present
      const maintenancePayload = (data.pending_maintenance ?? []).reduce<
        { id?: string; amount: number; reason: string }[]
      >((acc, p) => {
        const hasId = !!(p as any).id;
        const rawAmount =
          typeof p.amount === "string"
            ? Number(p.amount)
            : (p.amount as number);
        const amount = Number.isNaN(rawAmount) ? 0 : rawAmount;
        const reason = (p.reason ?? "").toString().trim();

        if (hasId) {
          // keep existing entries even if amount 0 (user might set 0 intentionally)
          acc.push({ id: (p as any).id, amount, reason });
        } else {
          // only include new rows that are non-empty
          if ((amount && amount > 0) || reason !== "") {
            acc.push({ amount, reason });
          }
        }
        return acc;
      }, []);

      const payload = {
        flat_number: data.flat_number,
        floor_number: Number(data.floor_number),
        square_foot: Number(data.square_foot),
        current_maintenance: Number(data.current_maintenance),
        pending_maintenance: maintenancePayload,
      };

      return updateFlat(flat.society_id, flat.building_id, flat.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["flats"] as any);
      queryClient.invalidateQueries(["flat-maintenance", flat?.id] as any);
      onClose();
    },
    onError: (err: any) => {
      // show a simple alert; adapt to your toast system
      console.error("Failed to update flat:", err);
      alert(err?.message || "Failed to update flat");
    },
  });

  const onSubmit = (data: FormData) => {
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
                type="number"
                inputProps={{ min: 0 }}
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
                type="number"
                inputProps={{ min: 0 }}
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
                type="number"
                inputProps={{ min: 0 }}
              />
            )}
          />

          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2">Pending Maintenance</Typography>
              {maintenanceLoading && <CircularProgress size={18} />}
            </Box>

            {/* If fetch errored, show small message */}
            {maintenanceError && (
              <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                Failed to load pending maintenance.
              </Typography>
            )}

            {fields.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No pending maintenance. You can add one below.
              </Typography>
            )}

            {fields.map((fieldItem, index) => (
              <Box
                key={fieldItem.id}
                display="flex"
                gap={1}
                mb={1}
                alignItems="center"
              >
                <Controller
                  name={`pending_maintenance.${index}.amount` as const}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Amount"
                      type="number"
                      fullWidth
                      inputProps={{ min: 0 }}
                    />
                  )}
                />

                <Controller
                  name={`pending_maintenance.${index}.reason` as const}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Reason" fullWidth />
                  )}
                />

                <IconButton
                  aria-label="delete"
                  color="error"
                  onClick={() => remove(index)}
                  sx={{ ml: 0.5 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              onClick={() => append({ amount: "", reason: "" })}
              sx={{ textTransform: "none", mt: 1 }}
            >
              + Add Entry
            </Button>
          </Box>
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
            Update Flat
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
