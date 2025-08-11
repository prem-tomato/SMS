"use client";

import CommonButton from "@/components/common/CommonButton";
import { createHousingUnit, getHousingUnitsOptions } from "@/services/housing";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
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
  societyId: string;
  role: string;
};

type Society = {
  id: string;
  name: string;
};

interface SocietyOption {
  id: string;
  name: string;
}

export default function AddHousingUnitDialog({
  open,
  onClose,
  societyId: adminSocietyId,
  role,
}: Props) {
  const t = useTranslations("AddHousingUnitDialog");
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HousingForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      society_id: role === "admin" ? adminSocietyId : "",
      unit_number: "",
      unit_type: "",
      square_foot: 0,
      current_maintenance: 0,
    },
  });

  // Set society_id when adminSocietyId changes or dialog opens
  useEffect(() => {
    if (role === "admin" && adminSocietyId && open) {
      setValue("society_id", adminSocietyId);
    }
  }, [adminSocietyId, role, open, setValue]);

  const { data: societyOptions = [], isLoading: isSocietyLoading } = useQuery({
    queryKey: ["housing-society-options"],
    queryFn: getHousingUnitsOptions,
  });

  const { data: societyName = "", isLoading: societyNameLoading } = useQuery({
    queryKey: ["admin-society-name", adminSocietyId],
    queryFn: async () => {
      if (!adminSocietyId) return "";
      try {
        const allSocieties = await getHousingUnitsOptions();
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

  const onSubmit = (data: HousingForm) => {
    // Ensure society_id is set for admin users
    if (role === "admin" && adminSocietyId) {
      data.society_id = adminSocietyId;
    }
    mutate(data);
  };

  const handleClose = () => {
    if (!isPending) {
      reset({
        society_id: role === "admin" ? adminSocietyId : "",
        unit_number: "",
        unit_type: "",
        square_foot: 0,
        current_maintenance: 0,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {t("title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("subtitle")}
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}
        >
          {role === "super_admin" ? (
            <Controller
              name="society_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label={t("society")}
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
          ) : (
            <Box>
              <Typography variant="subtitle2">{t("society")}</Typography>
              <Chip
                label={
                  societyNameLoading
                    ? t("loading")
                    : societyName || t("selectedSociety")
                }
                color="primary"
                sx={{ mt: 1 }}
              />
              {/* Hidden input to ensure society_id is included in form data */}
              <Controller
                name="society_id"
                control={control}
                render={({ field }) => (
                  <input type="hidden" {...field} value={adminSocietyId} />
                )}
              />
            </Box>
          )}

          <Controller
            name="unit_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("unitNumber")}
                fullWidth
                disabled={isPending}
                error={!!errors.unit_number}
                helperText={errors.unit_number?.message}
                placeholder={t("unitNumberPlaceholder")}
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
                label={t("unitType")}
                fullWidth
                disabled={isPending}
                error={!!errors.unit_type}
                helperText={errors.unit_type?.message}
              >
                <MenuItem value="Bungalows">{t("bungalows")}</MenuItem>
                <MenuItem value="Raw House">{t("rawHouse")}</MenuItem>
                <MenuItem value="Villas">{t("villas")}</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="square_foot"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                type="number"
                label={t("squareFoot")}
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
                label={t("currentMaintenance")}
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
            {t("cancel")}
          </Button>
          <CommonButton
            type="submit"
            variant="contained"
            loading={isPending}
            sx={{ bgcolor: "#1e1ee4" }}
          >
            {t("addUnit")}
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
