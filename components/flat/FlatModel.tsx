"use client";

import CommonButton from "@/components/common/CommonButton";
import { getSocietyIdFromLocalStorage } from "@/lib/auth";
import { fetchBuildingsBySociety } from "@/services/building";
import { createFlat } from "@/services/flats";
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
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  flat_number: z.string().min(1, "Flat number is required"),
  floor_number: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Invalid floor number",
  }),
  square_foot: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Square foot must be a positive number",
    }),
  pending_amount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Pending amount must be a number",
  }),
  pending_reason: z.string().min(1, "Pending reason is required"),
  current_maintenance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Current maintenance must be a number",
  }),
});

type FormData = z.infer<typeof schema>;

type Society = {
  id: string;
  name: string;
};

type Building = {
  id: string;
  name: string;
  total_floors: number;
};

export default function AddFlatModal({
  open,
  onClose,
  role,
  societyId: adminSocietyId,
}: {
  open: boolean;
  onClose: () => void;
  role: string;
  societyId?: string; // Make optional with default
}) {
  const queryClient = useQueryClient();
  const [societyId, setSocietyId] = useState(adminSocietyId || "");
  const [buildingId, setBuildingId] = useState("");
  const [backendError, setBackendError] = useState<string | null>(null);

  // Fetch societies for super_admin
  const { data: societies = [], isLoading: societiesLoading } = useQuery<
    Society[]
  >({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
    enabled: role === "super_admin",
  });

  // Fetch admin's society name
  const { data: societyName = "", isLoading: societyNameLoading } = useQuery({
    queryKey: ["admin-society-name", adminSocietyId],
    queryFn: async () => {
      if (!adminSocietyId) return "";
      try {
        const allSocieties = await fetchSocietyOptions();
        return (
          allSocieties.find((s: Society) => s.id === adminSocietyId)?.name || ""
        );
      } catch (error) {
        console.error("Failed to fetch society name:", error);
        return "";
      }
    },
    enabled: role === "admin" && !!adminSocietyId,
  });

  // Fetch buildings
  const { data: buildings = [], isLoading: buildingsLoading } = useQuery<
    Building[]
  >({
    queryKey: ["buildings", societyId],
    queryFn: () => fetchBuildingsBySociety(societyId),
    enabled: !!societyId,
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      flat_number: "",
      floor_number: "",
      square_foot: "",
      pending_amount: "",
      pending_reason: "",
      current_maintenance: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: {
      flat_number: string;
      floor_number: number;
      square_foot: number;
      pending_maintenance: { amount: number; reason: string };
      current_maintenance: number;
    }) => createFlat(societyId, buildingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flats", societyId] });
      reset();
      setBuildingId("");
      setBackendError(null);
      onClose();
    },
    onError: async (error: any) => {
      try {
        let errorMessage = "Something went wrong";

        // Handle different error response formats
        if (error?.response?.json) {
          const res = await error.response.json();
          errorMessage = res?.message || errorMessage;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        if (errorMessage.toLowerCase().includes("floor")) {
          setError("floor_number", { type: "manual", message: errorMessage });
        } else {
          setBackendError(errorMessage);
        }
      } catch (parseError) {
        setBackendError("Network error occurred");
      }
    },
  });

  const onSubmit = (data: FormData) => {
    let hasErrors = false;

    // Validate society selection
    if (!societyId) {
      setBackendError("Please select a society");
      hasErrors = true;
    }

    // Validate building selection
    if (!buildingId) {
      setBackendError("Please select a building");
      hasErrors = true;
    }

    // Validate floor number against building's total floors
    if (buildingId && data.floor_number) {
      const selectedBuilding = buildings.find((b) => b.id === buildingId);
      const floorNumber = Number(data.floor_number);

      if (selectedBuilding && floorNumber > selectedBuilding.total_floors) {
        setError("floor_number", {
          type: "manual",
          message: `Floor number cannot exceed ${selectedBuilding.total_floors} (building's total floors)`,
        });
        hasErrors = true;
      }

      if (floorNumber < 0) {
        setError("floor_number", {
          type: "manual",
          message: "Floor number cannot be negative",
        });
        hasErrors = true;
      }
    }

    if (hasErrors) return;

    setBackendError(null);
    mutation.mutate({
      flat_number: data.flat_number,
      floor_number: Number(data.floor_number),
      square_foot: Number(data.square_foot),
      pending_maintenance: {
        amount: Number(data.pending_amount),
        reason: data.pending_reason,
      },
      current_maintenance: Number(data.current_maintenance),
    });
  };

  // Reset form and state when modal opens
  useEffect(() => {
    if (open) {
      reset();
      setBackendError(null);

      if (role === "admin") {
        const storedId = adminSocietyId || getSocietyIdFromLocalStorage();
        if (storedId) {
          setSocietyId(storedId);
        }
      } else if (role === "super_admin") {
        setSocietyId("");
        setBuildingId("");
      }
    }
  }, [open, role, adminSocietyId, reset]);

  // Reset building when society changes and clear floor validation
  useEffect(() => {
    setBuildingId("");
    // Clear floor number errors when building changes
    if (errors.floor_number) {
      setError("floor_number", { type: "", message: "" });
    }
  }, [societyId, setError, errors.floor_number]);

  const buildingOptions = useMemo(
    () =>
      buildings.map((b) => (
        <MenuItem key={b.id} value={b.id}>
          {b.name} ({b.total_floors} floors)
        </MenuItem>
      )),
    [buildings]
  );

  const handleClose = () => {
    reset();
    setBuildingId("");
    setBackendError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Add New Flat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the flat details below
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            pb: 2,
          }}
        >
          {/* Society Field */}
          {role === "super_admin" ? (
            <FormControl
              fullWidth
              error={!societyId && backendError?.includes("society")}
            >
              <InputLabel>Society</InputLabel>
              <Select
                label="Society"
                value={societyId}
                onChange={(e) => {
                  setSocietyId(e.target.value);
                  setBuildingId("");
                  setBackendError(null);
                }}
                disabled={societiesLoading}
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
                {societies.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
              {!societyId && backendError?.includes("society") && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  Please select a society
                </Typography>
              )}
            </FormControl>
          ) : (
            <Box>
              <Typography variant="subtitle2">Society</Typography>
              <Chip
                label={
                  societyNameLoading
                    ? "Loading..."
                    : societyName || "Selected Society"
                }
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          {/* Building Dropdown */}
          <FormControl
            fullWidth
            disabled={!societyId || buildingsLoading}
            error={!buildingId && backendError?.includes("building")}
          >
            <InputLabel>Building</InputLabel>
            <Select
              label="Building"
              value={buildingId}
              onChange={(e) => {
                setBuildingId(e.target.value);
                setBackendError(null);
              }}
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
              {buildingOptions}
            </Select>
            {!buildingId && backendError?.includes("building") && (
              <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                Please select a building
              </Typography>
            )}
          </FormControl>

          {/* Flat Number */}
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
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            )}
          />

          {/* Floor Number */}
          <Controller
            name="floor_number"
            control={control}
            render={({ field }) => {
              const selectedBuilding = buildings.find(
                (b) => b.id === buildingId
              );
              const maxFloors = selectedBuilding?.total_floors;

              return (
                <TextField
                  {...field}
                  label="Floor Number"
                  placeholder={
                    maxFloors ? `e.g., 1 (max: ${maxFloors})` : "e.g., 1"
                  }
                  type="number"
                  error={!!errors.floor_number}
                  helperText={
                    errors.floor_number?.message ||
                    (maxFloors
                      ? `Maximum floors in this building: ${maxFloors}`
                      : "")
                  }
                  fullWidth
                  inputProps={{
                    min: 0,
                    max: maxFloors || undefined,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
              );
            }}
          />

          {/* Square Foot */}
          <Controller
            name="square_foot"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Square Foot"
                placeholder="e.g., 1200"
                error={!!errors.square_foot}
                helperText={errors.square_foot?.message}
                fullWidth
                type="number"
              />
            )}
          />

          {/* Pending Maintenance Amount & Reason - side by side */}
          <Box display="flex" gap={2}>
            <Controller
              name="pending_amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pending Amount"
                  placeholder="e.g., 10000"
                  error={!!errors.pending_amount}
                  helperText={errors.pending_amount?.message}
                  type="number"
                  fullWidth
                />
              )}
            />

            <Controller
              name="pending_reason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pending Reason"
                  placeholder="e.g., pipeline change"
                  error={!!errors.pending_reason}
                  helperText={errors.pending_reason?.message}
                  fullWidth
                />
              )}
            />
          </Box>

          {/* Current Maintenance */}
          <Controller
            name="current_maintenance"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Current Maintenance"
                placeholder="e.g., 2500"
                error={!!errors.current_maintenance}
                helperText={errors.current_maintenance?.message}
                fullWidth
                type="number"
              />
            )}
          />

          {/* Backend error */}
          {backendError && (
            <Typography color="error" variant="body2">
              {backendError}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleClose}
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
            Save Flat
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
