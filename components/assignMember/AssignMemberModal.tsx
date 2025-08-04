"use client";
import { UserResponse } from "@/app/api/users/user.types";
import { fetchBuildingsBySociety } from "@/services/building";
import { assignMembersToFlat, getVacantFlats } from "@/services/flats";
import {
  assignHousingUnitService,
  getHousingUnitsBySocietyId,
  getVacantHousingUnits,
} from "@/services/housing";
import { fetchSocietyOptions } from "@/services/societies";
import { fetchVacantUsersBySociety } from "@/services/user";
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
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import CommonButton from "../common/CommonButton";

// Schema for housing type (no building/flat needed)
const housingSchema = z.object({
  society_id: z.string().min(1, "Select society"),
  housing_unit_id: z.string().min(1, "Select housing unit"),
  user_id: z.array(z.string()).min(1, "Select at least one user"),
  move_in_date: z.string().min(1, "Select move-in date"),
});

const superAdminSchema = z.object({
  society_id: z.string().min(1, "Select society"),
  building_id: z.string().min(1, "Select building"),
  flat_id: z.string().min(1, "Select flat"),
  user_id: z.array(z.string()).min(1, "Select at least one user"),
  move_in_date: z.string().min(1, "Select move-in date"),
});

const adminSchema = z.object({
  building_id: z.string().min(1, "Select building"),
  flat_id: z.string().min(1, "Select flat"),
  user_id: z.array(z.string()).min(1, "Select at least one user"),
  move_in_date: z.string().min(1, "Select move-in date"),
});

// Schema for housing admin
const housingAdminSchema = z.object({
  housing_unit_id: z.string().min(1, "Select housing unit"),
  user_id: z.array(z.string()).min(1, "Select at least one user"),
  move_in_date: z.string().min(1, "Select move-in date"),
});

type SuperAdminFormValues = z.infer<typeof superAdminSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;
type HousingFormValues = z.infer<typeof housingSchema>;
type HousingAdminFormValues = z.infer<typeof housingAdminSchema>;
type FormValues =
  | SuperAdminFormValues
  | AdminFormValues
  | HousingFormValues
  | HousingAdminFormValues;

type AssignMemberModalProps = {
  open: boolean;
  onClose: () => void;
  role: string;
  adminSocietyId?: string;
  societyType?: string;
};

export default function AssignMemberModal({
  open,
  onClose,
  role,
  adminSocietyId,
  societyType,
}: AssignMemberModalProps) {
  const qc = useQueryClient();
  const isSuperAdmin = role === "super_admin";
  const isHousingSociety = societyType === "housing";

  // Determine schema and default values based on society type and role
  const getSchemaAndDefaults = () => {
    if (isHousingSociety) {
      if (isSuperAdmin) {
        return {
          schema: housingSchema,
          defaults: {
            society_id: "",
            housing_unit_id: "",
            user_id: [],
            move_in_date: "",
          },
        };
      } else {
        return {
          schema: housingAdminSchema,
          defaults: { housing_unit_id: "", user_id: [], move_in_date: "" },
        };
      }
    } else {
      if (isSuperAdmin) {
        return {
          schema: superAdminSchema,
          defaults: {
            society_id: "",
            building_id: "",
            flat_id: "",
            user_id: [],
            move_in_date: "",
          },
        };
      } else {
        return {
          schema: adminSchema,
          defaults: {
            building_id: "",
            flat_id: "",
            user_id: [],
            move_in_date: "",
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  // Watch form values for dependent dropdowns
  const watchedValues = useWatch({ control });
  const societyId = isSuperAdmin
    ? "society_id" in watchedValues
      ? watchedValues.society_id
      : ""
    : adminSocietyId;
  const buildingId =
    "building_id" in watchedValues ? watchedValues.building_id : "";

  // Fetch societies (only for super admin)
  const { data: societies = [], isLoading: lsSoc } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
    enabled: !!adminSocietyId || isSuperAdmin,
  });

  // Fetch buildings (only for non-housing societies)
  const { data: buildings = [], isLoading: lsBld } = useQuery({
    queryKey: ["buildings", societyId],
    queryFn: () => fetchBuildingsBySociety(societyId!),
    enabled: !!societyId && !isHousingSociety,
  });

  // // Fetch vacant flats (only for non-housing societies)
  // const { data: vacantFlats = [], isLoading: lsFlats } = useQuery({
  //   queryKey: ["vacantFlats", societyId, buildingId],
  //   queryFn: () => getVacantFlats(societyId!, buildingId!),
  //   enabled: !!buildingId && !!societyId && !isHousingSociety,
  // });
  // Fetch vacant flats/housing units
  const { data: vacantFlats = [], isLoading: lsFlats } = useQuery({
    queryKey: isHousingSociety
      ? ["vacantHousingUnits", societyId]
      : ["vacantFlats", societyId, buildingId],
    queryFn: () => {
      if (isHousingSociety) {
        // For housing societies, get all vacant housing units for the society
        return getVacantHousingUnits(societyId!); // Pass empty string or null for housingId
      } else {
        // For non-housing societies, get vacant flats for the building
        return getVacantFlats(societyId!, buildingId!);
      }
    },
    enabled: isHousingSociety ? !!societyId : !!buildingId && !!societyId,
  });

  // Fetch housing units (only for housing societies)
  const { data: housingUnits = [], isLoading: lsHousingUnits } = useQuery({
    queryKey: ["housingUnits", societyId],
    queryFn: () => getHousingUnitsBySocietyId(societyId!),
    enabled: !!societyId && isHousingSociety,
  });

  // Fetch users
  const { data: users = [], isLoading: lsUsers } = useQuery<UserResponse[]>({
    queryKey: ["users", societyId],
    queryFn: () => fetchVacantUsersBySociety(societyId!),
    enabled: !!societyId,
  });

  const mut = useMutation({
    mutationFn: (data: FormValues) => {
      const finalSocietyId = isSuperAdmin
        ? "society_id" in data
          ? data.society_id
          : adminSocietyId!
        : adminSocietyId!;

      if (isHousingSociety) {
        // For housing societies, we might need a different API call
        // Assuming you have an assignMembersToHousingUnit function
        const housingUnitId =
          "housing_unit_id" in data ? data.housing_unit_id : "";
        return assignHousingUnitService(
          finalSocietyId,
          housingUnitId, // use housing unit as flat
          {
            user_id: data.user_id,
            move_in_date: data.move_in_date,
          }
        );
      } else {
        return assignMembersToFlat(
          finalSocietyId,
          "building_id" in data ? data.building_id : "",
          "flat_id" in data ? data.flat_id : "",
          {
            user_id: data.user_id,
            move_in_date: data.move_in_date,
          }
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignedMembers"] });
      reset();
      onClose();
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => mut.mutate(data);

  const getDisplayName = (user: any) =>
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.name || user?.email || `User ${user.id}`;

  // Type-safe way to check for society_id error
  const getSocietyIdError = () => {
    if (isSuperAdmin && "society_id" in errors) {
      return errors.society_id;
    }
    return undefined;
  };

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (isSuperAdmin && societyId) {
      if (!isHousingSociety && "building_id" in watchedValues) {
        setValue("building_id", "");
        setValue("flat_id", "");
      }
      if (isHousingSociety && "housing_unit_id" in watchedValues) {
        setValue("housing_unit_id", "");
      }
    }
  }, [societyId, isSuperAdmin, setValue, isHousingSociety]);

  // Reset flat when building changes (non-housing only)
  useEffect(() => {
    if (!isHousingSociety && buildingId && "flat_id" in watchedValues) {
      setValue("flat_id", "");
    }
  }, [buildingId, setValue, isHousingSociety]);

  const getTitle = () => {
    if (isHousingSociety) return "Assign Unit to Resident";
    return societyType === "commercial"
      ? "Assign Shop to Owner"
      : "Assign Flat to Resident";
  };

  const getSubtitle = () => {
    if (isHousingSociety) return "Select housing unit and residents.";
    return societyType === "commercial"
      ? "Select Building, Shop and Owners."
      : "Select society, building, flat and members.";
  };

  const getUnitLabel = () => {
    if (isHousingSociety) return "Housing Unit";
    return societyType === "commercial" ? "Shop" : "Flat";
  };

  const getUserLabel = () => {
    if (isHousingSociety) return "Residents";
    return societyType === "commercial" ? "Owners" : "Residents";
  };

  const getButtonLabel = () => {
    if (isHousingSociety) return "Assign Unit to Resident";
    return societyType === "commercial"
      ? "Assign Shop to Owner"
      : "Assign Flat to Resident";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {getTitle()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getSubtitle()}
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}
        >
          {role === "admin" && adminSocietyId && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Society
              </Typography>
              <Chip
                label={
                  societies.find((s: any) => s.id === adminSocietyId)?.name ||
                  "Selected Society"
                }
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          {/* Society Dropdown (Super Admin Only) */}
          {isSuperAdmin && (
            <Controller
              name="society_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!getSocietyIdError()}>
                  <InputLabel>Society</InputLabel>
                  <Select
                    {...field}
                    label="Society"
                    sx={{ borderRadius: 2 }}
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
                    {lsSoc ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : (
                      societies.map((s: any) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {getSocietyIdError() && (
                    <Typography color="error" variant="caption">
                      {getSocietyIdError()?.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          )}

          {/* Housing Unit Dropdown (Housing societies only) */}
          {isHousingSociety && (
            <Controller
              name="housing_unit_id"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={!societyId}
                  error={
                    !!("housing_unit_id" in errors
                      ? errors.housing_unit_id
                      : undefined)
                  }
                >
                  <InputLabel>{getUnitLabel()}</InputLabel>
                  <Select
                    {...field}
                    label={getUnitLabel()}
                    sx={{ borderRadius: 2 }}
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
                    {lsFlats ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : (
                      vacantFlats.map((unit: any) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.unit_number} - {unit.unit_type} (
                          {unit.square_foot} sq ft)
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {"housing_unit_id" in errors && errors.housing_unit_id && (
                    <Typography color="error" variant="caption">
                      {errors.housing_unit_id.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          )}

          {/* Building Dropdown (Non-housing societies only) */}
          {!isHousingSociety && (
            <Controller
              name="building_id"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={!societyId}
                  error={
                    !!("building_id" in errors ? errors.building_id : undefined)
                  }
                >
                  <InputLabel>Building</InputLabel>
                  <Select
                    {...field}
                    label="Building"
                    sx={{ borderRadius: 2 }}
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
                    {lsBld ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : (
                      buildings.map((b: any) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {"building_id" in errors && errors.building_id && (
                    <Typography color="error" variant="caption">
                      {errors.building_id.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          )}

          {/* Flat Dropdown (Non-housing societies only) */}
          {!isHousingSociety && (
            <Controller
              name="flat_id"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={!buildingId}
                  error={!!("flat_id" in errors ? errors.flat_id : undefined)}
                >
                  <InputLabel>{getUnitLabel()}</InputLabel>
                  <Select
                    {...field}
                    label={getUnitLabel()}
                    sx={{ borderRadius: 2 }}
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
                    {lsFlats ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : (
                      vacantFlats.map((f: any) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.flat_number} – Floor {f.floor_number}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {"flat_id" in errors && errors.flat_id && (
                    <Typography color="error" variant="caption">
                      {errors.flat_id.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          )}

          {/* Members Multi-Select */}
          <Controller
            name="user_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.user_id}>
                <InputLabel>{getUserLabel()}</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={
                    <OutlinedInput
                      label={getUserLabel()}
                      sx={{ borderRadius: 2 }}
                    />
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => {
                        const user = users.find((u) => u.id === value);
                        return (
                          <Chip
                            key={value}
                            label={getDisplayName(user)}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                >
                  {users.length > 0 ? (
                    users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {getDisplayName(user)}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No users available</MenuItem>
                  )}
                </Select>
                {errors.user_id && (
                  <Typography color="error" variant="caption">
                    {errors.user_id.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Move-in Date */}
          <Controller
            name="move_in_date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Move-in Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                placeholder="Select date"
                error={!!errors.move_in_date}
                helperText={errors.move_in_date?.message}
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
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <CommonButton
            type="submit"
            variant="contained"
            loading={mut.isPending}
            sx={{ bgcolor: "#1e1ee4" }}
          >
            {getButtonLabel()}
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
