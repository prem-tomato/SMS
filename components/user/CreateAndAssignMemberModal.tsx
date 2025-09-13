"use client";

import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import { fetchBuildingsBySociety } from "@/services/building";
import { assignMembersToFlat, getVacantFlats } from "@/services/flats";
import {
  assignHousingUnitService,
  getHousingUnitsBySocietyId,
  getVacantHousingUnits,
} from "@/services/housing";
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

type SocietyType = "commercial" | "residential" | "housing";

interface CreateAndAssignFormValues {
  // User creation fields
  role: "admin" | "member";
  first_name: string;
  last_name: string | null;
  login_key: string;
  phone: string;

  // Assignment fields
  society_id?: string; // Only for super_admin
  building_id?: string; // Only for non-housing
  flat_id?: string[]; // Only for non-housing
  housing_unit_id?: string[]; // Only for housing
  move_in_date: string;

  // Assigned user ID (will be populated after creation)
  user_id?: string;
}

const CreateAndAssignMemberModal = ({
  open,
  onClose,
  societyType,
}: {
  open: boolean;
  onClose: () => void;
  societyType: SocietyType | null;
}) => {
  const t = useTranslations("CreateAndAssignMemberModal");
  const queryClient = useQueryClient();
  const [country, setCountry] = useState<CountryCode>("IN");
  const userRole = getUserRole(); // 'super_admin' | 'admin' | 'member'
  const adminSocietyId = getSocietyIdFromLocalStorage();

  const [isCreating, setIsCreating] = useState(false);

  // Determine if we're in housing mode
  const isHousing = societyType === "housing";

  // Schema builder function
  const getSchema = (t: any) =>
    z.object({
      role: z.enum(["admin", "member"]),
      first_name: z.string().min(1, t("validation.firstNameRequired")),
      last_name: z.string().optional(),
      login_key: z
        .string()
        .min(1, t("validation.loginKeyRequired"))
        .regex(/^\d+$/, t("validation.loginKeyDigits"))
        .refine((val) => val.length <= 6, t("validation.loginKeyMax6")),
      phone: z
        .string()
        .min(1, t("validation.phoneRequired"))
        .refine((val) => isValidPhoneNumber(val), t("validation.invalidPhone")),

      // Conditional assignment fields
      society_id:
        userRole === "super_admin"
          ? z.string().min(1, t("validation.selectSociety"))
          : z.string().optional(),

      building_id:
        !isHousing && userRole !== "super_admin"
          ? z.string().min(1, t("validation.selectBuilding"))
          : z.string().optional(),

      flat_id: !isHousing
        ? z.array(z.string()).min(1, t("validation.selectAtLeastOneFlat"))
        : z.array(z.string()).optional(),

      housing_unit_id: isHousing
        ? z.array(z.string()).min(1, t("validation.selectAtLeastOneUnit"))
        : z.array(z.string()).optional(),

      move_in_date: z.string().min(1, t("validation.selectMoveInDate")),
    });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateAndAssignFormValues>({
    resolver: zodResolver(getSchema(t) as any),
    defaultValues: {
      role: "member",
      first_name: "",
      last_name: "",
      login_key: "",
      phone: "",
      move_in_date: new Date().toISOString().split("T")[0],
      society_id: userRole === "super_admin" ? "" : undefined,
      building_id: userRole !== "super_admin" && !isHousing ? "" : undefined,
      flat_id: [],
      housing_unit_id: [],
    },
  });

  const watchedValues = useWatch({ control });
  const selectedSocietyId =
    userRole === "super_admin" ? watchedValues.society_id : adminSocietyId;
  const selectedBuildingId = watchedValues.building_id;

  // Fetch societies (only for super_admin)
  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
    enabled: userRole === "super_admin",
  });

  // Fetch buildings (only if not housing and society selected)
  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ["buildings", selectedSocietyId],
    queryFn: () => fetchBuildingsBySociety(selectedSocietyId!),
    enabled: !!selectedSocietyId && !isHousing,
  });

  // Fetch vacant units (flats or housing units)
  const { data: vacantUnits = [], isLoading: loadingUnits } = useQuery({
    queryKey: isHousing
      ? ["vacantHousingUnits", selectedSocietyId]
      : ["vacantFlats", selectedSocietyId, selectedBuildingId],
    queryFn: () =>
      isHousing
        ? getVacantHousingUnits(selectedSocietyId!)
        : getVacantFlats(selectedSocietyId!, selectedBuildingId!),
    enabled: !!selectedSocietyId && (!isHousing ? !!selectedBuildingId : true),
  });

  // Fetch housing units (for reference — optional)
  const { data: housingUnits = [], isLoading: loadingHousingUnits } = useQuery({
    queryKey: ["housingUnits", selectedSocietyId],
    queryFn: () => getHousingUnitsBySocietyId(selectedSocietyId!),
    enabled: isHousing && !!selectedSocietyId,
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateAndAssignFormValues) => {
      console.log("Starting mutation with data:", data); // Debug log
      // Validate society_id based on role
      const targetSocietyId =
        userRole === "super_admin" ? data.society_id! : adminSocietyId!;

      // STEP 1: Create the user
      console.log("Creating user..."); // Debug log
      const newUserResponse = await createUser(targetSocietyId, {
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name as any,
        login_key: Number(data.login_key) as any,
        phone: data.phone,
      });

      const userId = newUserResponse.id;

      // STEP 2: Assign to unit/flat
      console.log("Assigning to unit/flat..."); // Debug log
      if (isHousing) {
        const promises = data.housing_unit_id!.map((unitId) =>
          assignHousingUnitService(targetSocietyId, unitId, {
            user_id: [userId],
            move_in_date: data.move_in_date,
          })
        );
        await Promise.all(promises);
      } else {
        const promises = data.flat_id!.map((flatId) =>
          assignMembersToFlat(targetSocietyId, data.building_id!, flatId, {
            user_id: [userId],
            move_in_date: data.move_in_date,
          })
        );
        await Promise.all(promises);
      }

      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["assignedMembers"] });
      reset();
      onClose();
      toast.success(t("success.createdAndAssigned"));
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || t("errors.generic");
      toast.error(message);
      if (message.includes("login_key")) {
        setError("login_key", { type: "manual", message });
      }
    },
  });

  const onSubmit = (data: CreateAndAssignFormValues) => {
    console.log("Form submitted with data:", data); // Debug log
    mutation.mutate(data);
  };

  // Reset dependent fields when society changes
  useEffect(() => {
    if (userRole === "super_admin" && watchedValues.society_id) {
      setValue("building_id", "");
      setValue("flat_id", []);
      setValue("housing_unit_id", []);
    }
  }, [watchedValues.society_id, setValue, userRole]);

  // Reset flat when building changes
  useEffect(() => {
    if (!isHousing && watchedValues.building_id) {
      setValue("flat_id", []);
    }
  }, [watchedValues.building_id, setValue, isHousing]);

  const getTitle = () => {
    if (isHousing) return t("titles.assignUnitToNewResident");
    return societyType === "commercial"
      ? t("titles.assignShopToNewOwner")
      : t("titles.assignFlatToNewResident");
  };

  const getSubtitle = () => {
    if (isHousing) return t("subtitles.createAndAssignUnit");
    return societyType === "commercial"
      ? t("subtitles.createAndAssignShop")
      : t("subtitles.createAndAssignFlat");
  };

  const getUnitLabel = () => {
    if (isHousing) return t("labels.unit");
    return societyType === "commercial" ? t("labels.shop") : t("labels.flat");
  };

  const getMemberLabel = () => {
    if (isHousing) return t("labels.resident");
    return societyType === "commercial"
      ? t("labels.owner")
      : t("labels.resident");
  };

  const getSubmitLabel = () => {
    if (isHousing) return t("buttons.assignUnit");
    return societyType === "commercial"
      ? t("buttons.assignShop")
      : t("buttons.assignFlat");
  };

  // Temporary debug: Show all errors
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {getTitle()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getSubtitle()}
          </Typography>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Role */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>{t("labels.role")}</InputLabel>
                  <Select
                    {...field}
                    label={t("labels.role")}
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
                    <MenuItem value="member">{t("labels.member")}</MenuItem>
                    <MenuItem value="admin">{t("labels.admin")}</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Society (Super Admin Only) */}
            {userRole === "super_admin" && (
              <Controller
                name="society_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.society_id}>
                    <InputLabel>{t("labels.society")}</InputLabel>
                    <Select
                      {...field}
                      label={t("labels.society")}
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
                        <MenuItem disabled>{t("common.loading")}</MenuItem>
                      ) : (
                        societies.map((s: any) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name}
                          </MenuItem>
                        ))
                      )}
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

            {/* Show selected society chip for admin */}
            {userRole === "admin" && adminSocietyId && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {t("labels.society")}
                </Typography>
                <Chip
                  label={
                    societies.find((s: any) => s.id === adminSocietyId)?.name ||
                    t("common.selectedSociety")
                  }
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}

            {/* Building Dropdown (Non-Housing Only) */}
            {!isHousing && (
              <Controller
                name="building_id"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    disabled={!selectedSocietyId}
                    error={!!errors.building_id}
                  >
                    <InputLabel>{t("labels.building")}</InputLabel>
                    <Select
                      {...field}
                      label={t("labels.building")}
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
                        <MenuItem disabled>{t("common.loading")}</MenuItem>
                      ) : (
                        buildings.map((b: any) => (
                          <MenuItem key={b.id} value={b.id}>
                            {b.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.building_id && (
                      <Typography variant="caption" color="error">
                        {errors.building_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            {/* Unit / Flat Multi-Select */}
            <Controller
              name={isHousing ? "housing_unit_id" : "flat_id"}
              control={control}
              render={({ field }) => {
                const fieldName = isHousing ? "housing_unit_id" : "flat_id";
                const value = Array.isArray(field.value) ? field.value : [];

                return (
                  <FormControl
                    fullWidth
                    disabled={
                      !selectedSocietyId ||
                      (isHousing ? false : !selectedBuildingId)
                    }
                    error={!!errors[fieldName]}
                  >
                    <InputLabel>{getUnitLabel()}</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={
                        <OutlinedInput
                          label={getUnitLabel()}
                          sx={{ borderRadius: 2 }}
                        />
                      }
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((id) => {
                            const unit = vacantUnits.find(
                              (u: any) => u.id === id
                            );
                            if (!unit) return null;
                            if (isHousing) {
                              return (
                                <Chip
                                  key={id}
                                  label={`${unit.unit_number} - ${unit.unit_type}`}
                                  size="small"
                                />
                              );
                            } else {
                              return (
                                <Chip
                                  key={id}
                                  label={`${unit.flat_number} – ${t(
                                    "common.floor"
                                  )} ${unit.floor_number}`}
                                  size="small"
                                />
                              );
                            }
                          })}
                        </Box>
                      )}
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
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
                      {loadingUnits ? (
                        <MenuItem disabled>{t("common.loading")}</MenuItem>
                      ) : vacantUnits.length > 0 ? (
                        vacantUnits.map((unit: any) => (
                          <MenuItem key={unit.id} value={unit.id}>
                            {isHousing
                              ? `${unit.unit_number} - ${unit.unit_type} (${
                                  unit.square_foot
                                } ${t("common.sqFt")})`
                              : `${unit.flat_number} – ${t("common.floor")} ${
                                  unit.floor_number
                                }`}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {t("common.noUnitsAvailable")}
                        </MenuItem>
                      )}
                    </Select>
                    {errors[fieldName] && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block", mt: 1 }}
                      >
                        {errors[fieldName]?.message} (Selected: {value.length})
                      </Typography>
                    )}
                  </FormControl>
                );
              }}
            />

            {/* First Name */}
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("labels.firstName")}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  fullWidth
                  onBlur={() => trigger("first_name")}
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
                  label={t("labels.lastName")}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  fullWidth
                  onBlur={() => trigger("last_name")}
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
                  label={t("labels.loginKey")}
                  inputProps={{ maxLength: 6 }}
                  error={!!errors.login_key}
                  helperText={errors.login_key?.message}
                  fullWidth
                  onBlur={() => trigger("login_key")}
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
                    onBlur={() => trigger("phone")}
                  />
                  {errors.phone && (
                    <Typography variant="caption" color="error">
                      {errors.phone.message}
                    </Typography>
                  )}
                </Box>
              )}
            />

            {/* Move-in Date */}
            <Controller
              name="move_in_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("labels.moveInDate")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.move_in_date}
                  helperText={errors.move_in_date?.message}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  onBlur={() => trigger("move_in_date")}
                />
              )}
            />

            {/* Temporary Debug: Show All Errors */}
            {hasErrors && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "error.main",
                  color: "white",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Debug: Validation Errors Present
                </Typography>
                <Typography variant="body2">
                  {JSON.stringify(errors, null, 2)}
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={onClose}
              disabled={mutation.isPending || isSubmitting}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={mutation.isPending || isSubmitting}
              disabled={isSubmitting}
              onClick={(e) => {
                if (!isSubmitting) {
                  handleSubmit(onSubmit)(e);
                }
              }}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              {getSubmitLabel()}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default CreateAndAssignMemberModal;
