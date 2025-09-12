"use client";

import CommonButton from "@/components/common/CommonButton";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import { fetchBuildingsBySociety } from "@/services/building";
import { getVacantFlats } from "@/services/flats";
import { getVacantHousingUnits } from "@/services/housing";
import { fetchSocietyOptions } from "@/services/societies";
import { createUser } from "@/services/user";
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
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CountryCode } from "libphonenumber-js/core";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";

// Base schema for all user types
const baseSchema = z.object({
  role: z.enum(["admin", "member"]),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  login_key: z
    .string()
    .min(1, "Login key required")
    .regex(/^\d+$/, "Login key must be digits")
    .refine((val) => val.length <= 6, "Max 6 digits"),
  phone: z
    .string()
    .min(1, "Phone required")
    .refine((val) => isValidPhoneNumber(val), "Invalid phone number"),
  society_id: z.string().optional(),
});

// Extended schema for commercial and residential societies (requires building and flats)
const commercialResidentialSchema = baseSchema.extend({
  building_id: z.string().min(1, "Building is required"),
  flat_id: z.array(z.string()).min(1, "At least one shop/flat is required"),
});

// Extended schema for housing societies (requires housing units)
const housingSchema = baseSchema.extend({
  housing_unit_id: z.array(z.string()).min(1, "At least one unit is required"),
});

// Schema for super_admin that requires society_id
const superAdminCommercialResidentialSchema =
  commercialResidentialSchema.extend({
    society_id: z.string().min(1, "Society is required"),
  });

const superAdminHousingSchema = housingSchema.extend({
  society_id: z.string().min(1, "Society is required"),
});

type BaseFormValues = z.infer<typeof baseSchema>;
type CommercialResidentialFormValues = z.infer<
  typeof commercialResidentialSchema
>;
type HousingFormValues = z.infer<typeof housingSchema>;
type SuperAdminCommercialResidentialFormValues = z.infer<
  typeof superAdminCommercialResidentialSchema
>;
type SuperAdminHousingFormValues = z.infer<typeof superAdminHousingSchema>;

type FormValues =
  | BaseFormValues
  | CommercialResidentialFormValues
  | HousingFormValues
  | SuperAdminCommercialResidentialFormValues
  | SuperAdminHousingFormValues;

export default function AddUserModal({
  open,
  onClose,
  societyId,
  societyType,
}: {
  open: boolean;
  onClose: () => void;
  societyId?: string;
  societyType: string | null;
}) {
  const t = useTranslations("AddUserModal");
  const queryClient = useQueryClient();
  const [country, setCountry] = useState<CountryCode>("IN");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminSocietyId, setAdminSocietyId] = useState<string>("");

  // Determine which schema to use based on user role and society type
  const getSchemaAndDefaults = () => {
    const isHousing = societyType === "housing";
    const isSuperAdmin = userRole === "super_admin";

    if (isHousing) {
      if (isSuperAdmin) {
        return {
          schema: superAdminHousingSchema,
          defaults: {
            role: "member" as const,
            first_name: "",
            last_name: "",
            login_key: "",
            phone: "",
            society_id: "",
            housing_unit_id: [],
          },
        };
      } else {
        return {
          schema: housingSchema,
          defaults: {
            role: "member" as const,
            first_name: "",
            last_name: "",
            login_key: "",
            phone: "",
            housing_unit_id: [],
          },
        };
      }
    } else {
      // Commercial or residential
      if (isSuperAdmin) {
        return {
          schema: superAdminCommercialResidentialSchema,
          defaults: {
            role: "member" as const,
            first_name: "",
            last_name: "",
            login_key: "",
            phone: "",
            society_id: "",
            building_id: "",
            flat_id: [],
          },
        };
      } else {
        return {
          schema: commercialResidentialSchema,
          defaults: {
            role: "member" as const,
            first_name: "",
            last_name: "",
            login_key: "",
            phone: "",
            building_id: "",
            flat_id: [],
          },
        };
      }
    }
  };

  const { schema, defaults } = getSchemaAndDefaults();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: defaults,
  });

  // Watch form values for dependent dropdowns
  const watchedValues = useWatch({ control });
  const selectedSocietyId =
    userRole === "super_admin"
      ? "society_id" in watchedValues
        ? watchedValues.society_id
        : ""
      : adminSocietyId;
  const selectedBuildingId =
    "building_id" in watchedValues ? watchedValues.building_id : "";

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);

    if (role === "admin") {
      const societyId = getSocietyIdFromLocalStorage();
      if (societyId) setAdminSocietyId(societyId);
    }
  }, []);

  // Fetch societies (for super admin)
  const { data: societies = [] } = useQuery({
    queryKey: ["society-options"],
    queryFn: fetchSocietyOptions,
    enabled: userRole === "super_admin" || userRole === "admin",
  });

  // Fetch buildings (for commercial/residential societies)
  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ["buildings", selectedSocietyId],
    queryFn: () => fetchBuildingsBySociety(selectedSocietyId!),
    enabled: !!selectedSocietyId && societyType !== "housing",
  });

  // Fetch vacant flats/shops (for commercial/residential societies)
  const { data: vacantFlats = [], isLoading: loadingFlats } = useQuery({
    queryKey: ["vacantFlats", selectedSocietyId, selectedBuildingId],
    queryFn: () => getVacantFlats(selectedSocietyId!, selectedBuildingId!),
    enabled:
      !!selectedSocietyId && !!selectedBuildingId && societyType !== "housing",
  });

  // Fetch vacant housing units (for housing societies)
  const { data: vacantUnits = [], isLoading: loadingUnits } = useQuery({
    queryKey: ["vacantUnits", selectedSocietyId],
    queryFn: () => getVacantHousingUnits(selectedSocietyId!),
    enabled: !!selectedSocietyId && societyType === "housing",
  });

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    if (userRole === "super_admin" && selectedSocietyId) {
      if (societyType !== "housing") {
        setValue("building_id", "");
        setValue("flat_id", []);
      } else {
        setValue("housing_unit_id", []);
      }
    }
  }, [selectedSocietyId, userRole, setValue, societyType]);

  useEffect(() => {
    if (societyType !== "housing" && selectedBuildingId) {
      setValue("flat_id", []);
    }
  }, [selectedBuildingId, setValue, societyType]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const targetSocietyId =
        userRole === "super_admin"
          ? "society_id" in data
            ? data.society_id!
            : adminSocietyId
          : adminSocietyId;

      // Create user with shop/flat/unit assignment
      return createUser(targetSocietyId, {
        ...data,
        login_key: Number(data.login_key),
        // Include assignment data for API
        ...(societyType === "housing"
          ? {
              housing_unit_id:
                "housing_unit_id" in data ? data.housing_unit_id : [],
            }
          : {
              building_id: "building_id" in data ? data.building_id : "",
              flat_id: "flat_id" in data ? data.flat_id : [],
            }),
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["vacantFlats"] });
      queryClient.invalidateQueries({ queryKey: ["vacantUnits"] });
      reset();
      onClose();
      toast.success(t("success.userCreated"));
    },
    onError: (error: any) => {
      const message = error?.message || t("errors.generic");
      toast.error(message);
      if (message.includes("login key")) {
        setError("login_key", { type: "manual", message });
      }
    },
  });

  const onSubmit = (data: FormValues) => mutation.mutate(data);

  // Helper functions for labels and titles
  const getUnitLabel = () => {
    if (societyType === "housing") return t("housingUnit");
    return societyType === "commercial" ? t("shop") : t("flat");
  };

  const getUserTypeLabel = () => {
    if (societyType === "housing") return t("resident");
    return societyType === "commercial" ? t("shopOwner") : t("resident");
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {t("title", { type: getUserTypeLabel() })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("subtitle")}
          </Typography>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {userRole === "admin" && adminSocietyId && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {t("society")}
                </Typography>
                <Chip
                  label={
                    societies.find((s: any) => s.id === adminSocietyId)?.name ||
                    t("selectedSociety")
                  }
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}

            {/* Role */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>{t("role")}</InputLabel>
                  <Select
                    {...field}
                    label={t("role")}
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
                    <MenuItem value="member">{t("member")}</MenuItem>
                    <MenuItem value="admin">{t("admin")}</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Society (Super Admin only) */}
            {userRole === "super_admin" && (
              <Controller
                name="society_id"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={
                      !!("society_id" in errors ? errors.society_id : undefined)
                    }
                  >
                    <InputLabel>{t("society")}</InputLabel>
                    <Select
                      {...field}
                      label={t("society")}
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
                      {societies.map((s: any) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {"society_id" in errors && errors.society_id && (
                      <Typography variant="caption" color="error">
                        {errors.society_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            {/* Building (Commercial/Residential only) */}
            {societyType !== "housing" && (
              <Controller
                name="building_id"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    disabled={!selectedSocietyId}
                    error={
                      !!("building_id" in errors
                        ? errors.building_id
                        : undefined)
                    }
                  >
                    <InputLabel>{t("building")}</InputLabel>
                    <Select
                      {...field}
                      label={t("building")}
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
                      {loadingBuildings ? (
                        <MenuItem disabled>{t("loading")}</MenuItem>
                      ) : (
                        buildings.map((b: any) => (
                          <MenuItem key={b.id} value={b.id}>
                            {b.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {"building_id" in errors && errors.building_id && (
                      <Typography variant="caption" color="error">
                        {errors.building_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            {/* Flats/Shops (Commercial/Residential only) */}
            {societyType !== "housing" && (
              <Controller
                name="flat_id"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    disabled={!selectedBuildingId}
                    error={!!("flat_id" in errors ? errors.flat_id : undefined)}
                  >
                    <InputLabel>{getUnitLabel()}</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label={getUnitLabel()} />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => {
                            const unit = vacantFlats.find(
                              (f: any) => f.id === value
                            );
                            return (
                              <Chip
                                key={value}
                                label={`${unit?.flat_number} - Floor ${unit?.floor_number}`}
                                size="small"
                              />
                            );
                          })}
                        </Box>
                      )}
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
                      {loadingFlats ? (
                        <MenuItem disabled>{t("loading")}</MenuItem>
                      ) : (
                        vacantFlats.map((f: any) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.flat_number} - Floor {f.floor_number}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {"flat_id" in errors && errors.flat_id && (
                      <Typography variant="caption" color="error">
                        {errors.flat_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            {/* Housing Units (Housing societies only) */}
            {societyType === "housing" && (
              <Controller
                name="housing_unit_id"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    disabled={!selectedSocietyId}
                    error={
                      !!("housing_unit_id" in errors
                        ? errors.housing_unit_id
                        : undefined)
                    }
                  >
                    <InputLabel>{getUnitLabel()}</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label={getUnitLabel()} />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => {
                            const unit = vacantUnits.find(
                              (u: any) => u.id === value
                            );
                            return (
                              <Chip
                                key={value}
                                label={`${unit?.unit_number} - ${unit?.unit_type}`}
                                size="small"
                              />
                            );
                          })}
                        </Box>
                      )}
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
                      {loadingUnits ? (
                        <MenuItem disabled>{t("loading")}</MenuItem>
                      ) : (
                        vacantUnits.map((u: any) => (
                          <MenuItem key={u.id} value={u.id}>
                            {u.unit_number} - {u.unit_type} ({u.square_foot} sq
                            ft)
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {"housing_unit_id" in errors && errors.housing_unit_id && (
                      <Typography variant="caption" color="error">
                        {errors.housing_unit_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            {/* First Name */}
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("firstName")}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  fullWidth
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
                  label={t("lastName")}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  fullWidth
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
                  label={t("loginKey")}
                  inputProps={{ maxLength: 6 }}
                  error={!!errors.login_key}
                  helperText={errors.login_key?.message}
                  fullWidth
                />
              )}
            />

            {/* Phone Input */}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Box>
                  <PhoneInput
                    {...field}
                    defaultCountry={country}
                    onChange={(val) => field.onChange(val)}
                    onCountryChange={(c) => setCountry(c as CountryCode)}
                    international
                    countryCallingCodeEditable={false}
                    className="phone-input"
                  />
                  {errors.phone && (
                    <Typography variant="caption" color="error">
                      {errors.phone.message}
                    </Typography>
                  )}
                </Box>
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={onClose}>{t("cancel")}</Button>
            <CommonButton
              type="submit"
              variant="contained"
              loading={mutation.isPending}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              {t("save", { type: getUserTypeLabel() })}
            </CommonButton>
          </DialogActions>
        </Box>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
