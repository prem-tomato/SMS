"use client";

import CommonButton from "@/components/common/CommonButton";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  createBuilding,
  fetchBuildingBySocietyForAdmin,
  fetchBuildings,
} from "@/services/building";
import { fetchSocietyOptions } from "@/services/societies";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
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

// ✅ Zod Schemas
const inputSchema = z.object({
  society_id: z.string().min(1, "Select society"),
  name: z.string().min(1, "Building name is required"),
  total_floors: z.string().min(1, "Total floors is required"),
});

const outputSchema = z.object({
  society_id: z.string().min(1, "Select society"),
  name: z.string().min(1, "Building name is required"),
  total_floors: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => val > 0, "At least one floor required"),
});

type FormValues = z.infer<typeof inputSchema>;
type OutputValues = z.infer<typeof outputSchema>;

export default function BuildingsPage() {
  const queryClient = useQueryClient();

  const [role, setRole] = useState<string | null>(null);
  const [adminSocietyId, setAdminSocietyId] = useState<string | null>(null);

  useEffect(() => {
    const userRole = getUserRole();
    const society = getSocietyIdFromLocalStorage();
    setRole(userRole);
    setAdminSocietyId(society);
  }, []);

  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ["buildings", role, adminSocietyId],
    queryFn: async () => {
      if (role === "admin" && adminSocietyId) {
        return fetchBuildingBySocietyForAdmin(adminSocietyId);
      }
      return fetchBuildings();
    },
    enabled: !!role,
  });

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
  });

  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      society_id: "",
      name: "",
      total_floors: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: OutputValues) =>
      createBuilding(data.society_id, {
        name: data.name,
        total_floors: data.total_floors,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: FormValues) => {
    const result = outputSchema.safeParse(data);
    if (result.success) {
      mutation.mutate(result.data);
    }
  };

  const columns = useMemo(
    () => [
      { field: "name", headerName: "Building Name", flex: 1 },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: "Society", flex: 1 }]
        : []),
      { field: "total_floors", headerName: "Total Floors", flex: 1 },
      {
        field: "action_by",
        headerName: "Action By",
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params.value}
            size="small"
            color="primary"
            sx={{ fontSize: "0.75rem" }}
          />
        ),
      },
    ],
    [role]
  );

  const handleOpen = () => {
    if (role === "admin" && adminSocietyId) {
      reset({ society_id: adminSocietyId, name: "", total_floors: "" });
    } else {
      reset({ society_id: "", name: "", total_floors: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <Box height="calc(100vh - 100px)">
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            borderRadius: 1,
            border: "1px solid #1e1ee4",
            color: "#1e1ee4",
          }}
        >
          Add Building
        </Button>
      </Box>

      {/* DataGrid */}
      <CommonDataGrid
        rows={buildings}
        columns={columns}
        loading={loadingBuildings}
        height="calc(100vh - 180px)" // Adjust based on header/toolbar height
        pageSize={20}
      />

      {/* Add Building Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Add New Building
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the building details below
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
            {role === "admin" ? (
              <Box>
                <Typography variant="subtitle2">Society</Typography>
                <Chip
                  label={
                    societies.find((s: any) => s.id === adminSocietyId)?.name ||
                    "Selected Society"
                  }
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>
            ) : (
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
                      {loadingSocieties ? (
                        <MenuItem disabled>Loading...</MenuItem>
                      ) : (
                        societies.map((s: any) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.society_id && (
                      <Typography color="error" variant="caption">
                        {errors.society_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            {/* Building Name */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Building Name"
                  placeholder="e.g., A Wing"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
              )}
            />

            {/* Total Floors */}
            <Controller
              name="total_floors"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Total Floors"
                  placeholder="e.g., 10"
                  type="number"
                  error={!!errors.total_floors}
                  helperText={errors.total_floors?.message}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
              )}
            />
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
              Save Building
            </CommonButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
