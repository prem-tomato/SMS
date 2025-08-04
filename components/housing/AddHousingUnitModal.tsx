"use client";

import CommonButton from "@/components/common/CommonButton";
import { createHousingUnit, getHousingUnitsOptions } from "@/services/housing";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  society_id: z.string().uuid("Please select a valid society"),
  unit_number: z
    .string()
    .min(1, "Unit number is required")
    .max(20, "Unit number must be 20 characters or less"),
  unit_type: z
    .string()
    .min(1, "Unit type is required")
    .max(50, "Unit type must be 50 characters or less"),
  address_line: z
    .string()
    .min(1, "Address is required")
    .max(100, "Address must be 100 characters or less"),
  square_foot: z.number().int().min(1, "Square foot must be at least 1"),
  current_maintenance: z
    .number()
    .min(0, "Maintenance cannot be negative")
    .max(1000000, "Maintenance cannot exceed 1,000,000"),
});

type HousingForm = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

// Define proper type for society option
interface SocietyOption {
  id: string;
  name: string;
}

export default function AddHousingUnitDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HousingForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      society_id: "",
      unit_number: "",
      unit_type: "",
      address_line: "",
      square_foot: 0,
      current_maintenance: 0,
    },
  });

  const { data: societyOptions = [], isLoading: isSocietyLoading } = useQuery({
    queryKey: ["housing-society-options"],
    queryFn: getHousingUnitsOptions,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ society_id, ...rest }: HousingForm) =>
      createHousingUnit(society_id, rest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housing-units"] });
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to create housing unit:", error);
      // You might want to show a toast notification here
    },
  });

  const onSubmit = (data: HousingForm) => mutate(data);

  const handleClose = () => {
    if (!isPending) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Add New Housing Unit
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the unit details below
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
          <Controller
            name="society_id"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Society"
                error={!!errors.society_id}
                helperText={errors.society_id?.message}
                disabled={isSocietyLoading || isPending}
              >
                {societyOptions.map((soc: SocietyOption) => (
                  <MenuItem key={soc.id} value={soc.id}>
                    {soc.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="unit_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Unit Number"
                fullWidth
                disabled={isPending}
                error={!!errors.unit_number}
                helperText={errors.unit_number?.message}
                placeholder="e.g., A-101, B-205"
              />
            )}
          />

          <Controller
            name="unit_type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Unit Type"
                fullWidth
                disabled={isPending}
                error={!!errors.unit_type}
                helperText={errors.unit_type?.message}
              >
                <MenuItem value="Bungalows">Bungalows</MenuItem>
                <MenuItem value="Raw House">Raw House</MenuItem>
                <MenuItem value="Villas">Villas</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="address_line"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Address Line"
                fullWidth
                disabled={isPending}
                error={!!errors.address_line}
                helperText={errors.address_line?.message}
                placeholder="Street address, building details"
              />
            )}
          />

          <Controller
            name="square_foot"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                type="number"
                label="Square Foot"
                fullWidth
                disabled={isPending}
                value={value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange(val === "" ? 0 : parseInt(val, 10));
                }}
                error={!!errors.square_foot}
                helperText={errors.square_foot?.message}
                inputProps={{ min: 1, step: 1 }}
              />
            )}
          />

          <Controller
            name="current_maintenance"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                type="number"
                label="Current Maintenance"
                fullWidth
                disabled={isPending}
                value={value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange(val === "" ? 0 : parseFloat(val));
                }}
                error={!!errors.current_maintenance}
                helperText={errors.current_maintenance?.message}
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleClose}
            disabled={isPending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <CommonButton
            type="submit"
            variant="contained"
            loading={isPending}
            sx={{ bgcolor: "#1e1ee4" }}
          >
            Add Unit
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
