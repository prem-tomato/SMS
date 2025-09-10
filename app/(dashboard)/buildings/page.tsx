"use client";

import CommonButton from "@/components/common/CommonButton";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  createBuilding,
  deleteBuilding,
  fetchBuildingBySocietyForAdmin,
  fetchBuildings,
  updateBuilding,
} from "@/services/building";
import { fetchSocietyOptionsForFlat } from "@/services/societies";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

// Zod Schemas
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
  const t = useTranslations("building");
  const queryClient = useQueryClient();

  const [role, setRole] = useState<string | null>(null);
  const [adminSocietyId, setAdminSocietyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editBuilding, setEditBuilding] = useState<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null
  );

  // Delete confirmation dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<any | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null); // ✅ New state for error in dialog

  useEffect(() => {
    setRole(getUserRole());
    setAdminSocietyId(getSocietyIdFromLocalStorage());
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
    queryFn: fetchSocietyOptionsForFlat,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      society_id: "",
      name: "",
      total_floors: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: OutputValues) =>
      createBuilding(data.society_id, {
        name: data.name,
        total_floors: data.total_floors,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      toast.success(
        t("buildingCreatedSuccessfully") || "Building created successfully!"
      );
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create building";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: OutputValues) =>
      updateBuilding(data.society_id, editBuilding.id, {
        name: data.name,
        total_floors: data.total_floors,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      toast.success(
        t("buildingUpdatedSuccessfully") || "Building updated successfully!"
      );
      setOpen(false);
      setEditBuilding(null);
      reset();
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update building";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      societyId,
      buildingId,
    }: {
      societyId: string;
      buildingId: string;
    }) => deleteBuilding(societyId, buildingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      toast.success(
        t("buildingDeletedSuccessfully") || "Building deleted successfully!"
      );
      setDeleteConfirmOpen(false);
      setBuildingToDelete(null);
      setDeleteError(null); // Clear error on success
    },
    onError: (error: any) => {
      console.log("Delete error:", error);

      let errorMessage = "Failed to delete building";

      if (error?.message) {
        errorMessage = error.message;
      }

      // Handle flats association error
      if (
        errorMessage.includes(
          "Building cannot be deleted because it has associated flats"
        ) ||
        errorMessage.includes("associated flats")
      ) {
        errorMessage =
          t("cannotDeleteBuildingWithFlats") ||
          "Cannot delete building because it has associated flats. Please remove all flats first.";
      }

      // ✅ SET ERROR IN DIALOG — DO NOT USE TOAST
      setDeleteError(errorMessage);

      // ❌ DO NOT close dialog or clear buildingToDelete
      // User should see error and close manually
    },
  });

  const onSubmit = (data: FormValues) => {
    const result = outputSchema.safeParse(data);
    if (result.success) {
      if (editBuilding) {
        updateMutation.mutate(result.data);
      } else {
        createMutation.mutate(result.data);
      }
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    building: any
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBuildingId(building.id);
    setEditBuilding(building);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBuildingId(null);
  };

  const handleEdit = () => {
    if (editBuilding) {
      setValue("society_id", editBuilding.society_id || adminSocietyId || "");
      setValue("name", editBuilding.name);
      setValue("total_floors", editBuilding.total_floors.toString());
      setOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (editBuilding) {
      setBuildingToDelete(editBuilding);
      setDeleteError(null); // ✅ Clear error when opening for new building
      setDeleteConfirmOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    setDeleteError(null); // ✅ Clear previous error before new attempt
    if (buildingToDelete && adminSocietyId) {
      deleteMutation.mutate({
        societyId: adminSocietyId,
        buildingId: buildingToDelete.id,
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setBuildingToDelete(null);
    setDeleteError(null); // ✅ Clear error on cancel
  };

  const columns = useMemo(
    () => [
      { field: "name", headerName: t("buildingName"), flex: 1 },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: t("society"), flex: 1 }]
        : []),
      { field: "total_floors", headerName: t("totalFloors"), flex: 1 },
      {
        field: "action_by",
        headerName: t("actionBy"),
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
      {
        field: "actions",
        headerName: t("actions"),
        width: 100,
        renderCell: (params: any) => (
          <>
            <IconButton onClick={(event) => handleMenuOpen(event, params.row)}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && selectedBuildingId === params.row.id}
              onClose={handleMenuClose}
              PaperProps={{ sx: { minWidth: 120 } }}
            >
              <MenuItem onClick={handleEdit}>{t("edit")}</MenuItem>
              <MenuItem
                onClick={handleDeleteClick}
                sx={{ color: "error.main" }}
              >
                {t("delete")}
              </MenuItem>
            </Menu>
          </>
        ),
      },
    ],
    [role, t, anchorEl, selectedBuildingId]
  );

  const handleOpen = () => {
    if (role === "admin" && adminSocietyId) {
      reset({ society_id: adminSocietyId, name: "", total_floors: "" });
    } else {
      reset({ society_id: "", name: "", total_floors: "" });
    }
    setEditBuilding(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditBuilding(null);
    reset();
  };

  return (
    <Box height="calc(100vh - 180px)">
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
          {t("addBuilding")}
        </Button>
      </Box>

      {/* DataGrid */}
      <CommonDataGrid
        rows={buildings}
        columns={columns}
        loading={loadingBuildings}
        height="calc(100vh - 180px)"
        pageSize={20}
      />

      {/* Add/Edit Building Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {editBuilding ? t("editBuilding") : t("addNewBuilding")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("fillDetails")}
          </Typography>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}
          >
            {/* Society Field */}
            {role === "admin" ? (
              <Box>
                <Typography variant="subtitle2">{t("society")}</Typography>
                <Chip
                  label={
                    societies.find((s: any) => s.id === adminSocietyId)?.name ||
                    t("selectedSociety")
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
                    <InputLabel>{t("society")}</InputLabel>
                    <Select
                      {...field}
                      label={t("society")}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            "& .MuiMenuItem-root": { fontSize: "0.875rem" },
                          },
                        },
                      }}
                    >
                      {loadingSocieties ? (
                        <MenuItem disabled>{t("loading")}</MenuItem>
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
                  label={t("buildingName")}
                  placeholder={t("buildingNamePlaceholder")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                  label={t("totalFloors")}
                  placeholder={t("totalFloorsPlaceholder")}
                  type="number"
                  error={!!errors.total_floors}
                  helperText={errors.total_floors?.message}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={handleClose}
              disabled={createMutation.isPending || updateMutation.isPending}
              sx={{ textTransform: "none" }}
            >
              {t("cancel")}
            </Button>
            <CommonButton
              type="submit"
              variant="contained"
              loading={createMutation.isPending || updateMutation.isPending}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              {editBuilding ? t("updateBuilding") : t("saveBuilding")}
            </CommonButton>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2 }}
        >
          <WarningIcon color="warning" />
          <Typography variant="h6" fontWeight="bold">
            {t("confirmDelete") || "Confirm Delete"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("deleteConfirmationMessage") ||
              "Are you sure you want to delete this building?"}
          </Typography>

          {buildingToDelete && (
            <Box
              sx={{
                bgcolor: "grey.50",
                p: 2,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("buildingName")}:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {buildingToDelete.name}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {t("totalFloors")}:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {buildingToDelete.total_floors}
              </Typography>
            </Box>
          )}

          <Typography
            variant="body2"
            color="warning.main"
            sx={{ mt: 2, fontStyle: "italic" }}
          >
            {t("deleteWarning") || "This action cannot be undone."}
          </Typography>

          {/* ✅ Show error in dialog if exists */}
          {deleteError && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                color: "error.dark",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "error.main",
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {deleteError}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCancelDelete}
            disabled={deleteMutation.isPending}
            sx={{ textTransform: "none" }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending || !!deleteError} // ✅ Disable if error shown
            startIcon={deleteMutation.isPending ? null : <DeleteIcon />}
            sx={{ textTransform: "none" }}
          >
            {deleteMutation.isPending
              ? t("deleting") || "Deleting..."
              : t("delete") || "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
