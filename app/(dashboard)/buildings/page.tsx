"use client";

import CommonButton from "@/components/common/CommonButton";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { createBuilding, fetchBuildings } from "@/services/building";
import { fetchSocietyOptions } from "@/services/societies";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Chip,
  Container,
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
import { useMemo, useState } from "react";
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

  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ["buildings"],
    queryFn: fetchBuildings,
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
    defaultValues: { society_id: "", name: "", total_floors: "" },
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
      { field: "society_name", headerName: "Society", flex: 1 },
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
    []
  );

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <Container maxWidth="xl">
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
          onClick={() => setOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            px: 2,
            py: 0.8,
            borderRadius: 2,
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
            {/* Society Select */}
            <Controller
              name="society_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.society_id}>
                  <InputLabel>Society</InputLabel>
                  <Select
                    {...field}
                    label="Society"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
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
    </Container>
  );
}
