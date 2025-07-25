"use client";
import { UserResponse } from "@/app/api/users/user.types";
import { fetchBuildingsBySociety } from "@/services/building";
import { assignMembersToFlat, getVacantFlats } from "@/services/flats";
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

type SuperAdminFormValues = z.infer<typeof superAdminSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;
type FormValues = SuperAdminFormValues | AdminFormValues;

type AssignMemberModalProps = {
  open: boolean;
  onClose: () => void;
  role: string;
  adminSocietyId?: string;
};

export default function AssignMemberModal({
  open,
  onClose,
  role,
  adminSocietyId,
}: AssignMemberModalProps) {
  const qc = useQueryClient();
  const isSuperAdmin = role === "super_admin";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(isSuperAdmin ? superAdminSchema : adminSchema),
    defaultValues: isSuperAdmin
      ? {
          society_id: "",
          building_id: "",
          flat_id: "",
          user_id: [],
          move_in_date: "",
        }
      : { building_id: "", flat_id: "", user_id: [], move_in_date: "" },
  });

  // Watch form values for dependent dropdowns
  const watchedValues = useWatch({ control });
  const societyId = isSuperAdmin
    ? (watchedValues as SuperAdminFormValues).society_id
    : adminSocietyId;
  const buildingId = watchedValues.building_id;

  // Fetch societies (only for super admin)
  const { data: societies = [], isLoading: lsSoc } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
    enabled: !!adminSocietyId || isSuperAdmin,
  });

  // Fetch buildings
  const { data: buildings = [], isLoading: lsBld } = useQuery({
    queryKey: ["buildings", societyId],
    queryFn: () => fetchBuildingsBySociety(societyId!),
    enabled: !!societyId,
  });

  // Fetch vacant flats
  const { data: vacantFlats = [], isLoading: lsFlats } = useQuery({
    queryKey: ["vacantFlats", societyId, buildingId],
    queryFn: () => getVacantFlats(societyId!, buildingId!),
    enabled: !!buildingId && !!societyId,
  });

  // Fetch users
  const { data: users = [], isLoading: lsUsers } = useQuery<UserResponse[]>({
    queryKey: ["users", societyId],
    queryFn: () => fetchVacantUsersBySociety(societyId!),
    enabled: !!societyId,
  });

  // Get society name for admin
  const adminSocietyName =
    societies.find((s: any) => s.id === adminSocietyId)?.name ??
    (lsSoc ? "Loading..." : "Not found");

  const mut = useMutation({
    mutationFn: (data: FormValues) => {
      const finalSocietyId = isSuperAdmin
        ? (data as SuperAdminFormValues).society_id
        : adminSocietyId!;
      return assignMembersToFlat(
        finalSocietyId,
        data.building_id,
        data.flat_id,
        {
          user_id: data.user_id,
          move_in_date: data.move_in_date,
        }
      );
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

  // Reset building and flat when society changes (super admin only)
  useEffect(() => {
    if (isSuperAdmin && societyId && watchedValues.building_id) {
      setValue("building_id", "");
      setValue("flat_id", "");
    }
  }, [societyId, isSuperAdmin, setValue]);

  // Reset flat when building changes
  useEffect(() => {
    if (buildingId && watchedValues.flat_id) {
      setValue("flat_id", "");
    }
  }, [buildingId, setValue]);

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
          Assign Members
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select {isSuperAdmin ? "society, building, flat" : "building, flat"}{" "}
          and members with their move-in date
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

          {/* Building Dropdown */}
          <Controller
            name="building_id"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                disabled={!societyId}
                error={!!errors.building_id}
              >
                <InputLabel>Building</InputLabel>
                <Select {...field} label="Building" sx={{ borderRadius: 2 }}>
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
                {errors.building_id && (
                  <Typography color="error" variant="caption">
                    {errors.building_id.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Flat Dropdown */}
          <Controller
            name="flat_id"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                disabled={!buildingId}
                error={!!errors.flat_id}
              >
                <InputLabel>Flat</InputLabel>
                <Select {...field} label="Flat" sx={{ borderRadius: 2 }}>
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
                {errors.flat_id && (
                  <Typography color="error" variant="caption">
                    {errors.flat_id.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Members Multi-Select */}
          <Controller
            name="user_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.user_id}>
                <InputLabel>Members</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={
                    <OutlinedInput label="Members" sx={{ borderRadius: 2 }} />
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
            Assign Members
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
