"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddHousingUnitModal from "@/components/housing/AddHousingUnitModal";
import { ViewHousingUnitModal } from "@/components/housing/ViewHousingUnitPenaltiesModal";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  deleteHousingUnitService,
  getHousingUnitsBySocietyIdService,
  updateHousingUnit,
} from "@/services/housing";
import { addPenaltyForUnit } from "@/services/housing-unit-penalty";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema for edit form
const editSchema = z.object({
  unit_number: z
    .string()
    .min(1, "Unit number is required")
    .max(20, "Unit number must be less than 20 characters")
    .optional(),
  unit_type: z
    .string()
    .min(1, "Unit type is required")
    .max(50, "Unit type must be less than 50 characters")
    .optional(),
  square_foot: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number()
      .int("Square foot must be an integer")
      .min(1, "Square foot must be at least 1")
      .optional()
  ),
  current_maintenance: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number()
      .min(0, "Current maintenance must be greater than or equal to 0")
      .max(1000000, "Current maintenance must be less than or equal to 1000000")
      .optional()
  ),
});

type EditHousingForm = z.infer<typeof editSchema>;

interface HousingUnit {
  id: string;
  unit_number: string;
  unit_type: string;
  square_foot: number;
  is_occupied: boolean;
  current_maintenance: number;
  society_id?: string;
  society?: {
    id: string;
    name: string;
  };
}

export default function HousingUnitsPage() {
  const t = useTranslations("housing-units");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [societyId, setSocietyId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<HousingUnit | null>(null);
  const [penaltyDialogOpen, setPenaltyDialogOpen] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [viewPenaltiesOpen, setViewPenaltiesOpen] = useState(false);
  const [viewPenaltiesData, setViewPenaltiesData] = useState<{
    societyId: string;
    housingUnitId: string;
  } | null>(null);
  const [viewUnitOpen, setViewUnitOpen] = useState(false);
  const [viewUnitData, setViewUnitData] = useState<{
    societyId: string;
    housingUnitId: string;
    unitData: any;
  } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Form for editing housing unit
  const {
    control,
    handleSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<EditHousingForm>({
    resolver: zodResolver(editSchema) as any,
    mode: "onChange", // Validate on change to show immediate feedback
    defaultValues: {
      unit_number: "",
      unit_type: "",
      square_foot: 0,
      current_maintenance: 0,
    },
  });

  useEffect(() => {
    const storedSocietyId = getSocietyIdFromLocalStorage();
    const role = getUserRole(); // Assume this function exists in your auth utils

    if (storedSocietyId) {
      setSocietyId(storedSocietyId);
    }
    if (role) {
      setUserRole(role);
    }
  }, []);

  const {
    data: housingUnits = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["housing-units"],
    queryFn: () => getHousingUnitsBySocietyIdService(societyId),
    enabled: societyId !== "",
  });

  const { mutate: addPenalty, isPending } = useMutation({
    mutationFn: ({
      societyId,
      housingUnitId,
      payload,
    }: {
      societyId: string;
      housingUnitId: string;
      payload: { amount: number; reason: string };
    }) => addPenaltyForUnit(societyId, housingUnitId, payload),
    onSuccess: () => {
      setPenaltyDialogOpen(false);
      setPenaltyAmount("");
      setPenaltyReason("");
      queryClient.invalidateQueries(["housing-units"] as any);
    },
    onError: (error: any) => {
      alert(error.message || t("errors.failedToAddPenalty"));
    },
  });

  // Mutation for updating housing unit
  const { mutate: updateUnit, isPending: isUpdating } = useMutation({
    mutationFn: ({
      societyId,
      housingId,
      payload,
    }: {
      societyId: string;
      housingId: string;
      payload: EditHousingForm;
    }) => updateHousingUnit(societyId, housingId, payload),
    onSuccess: () => {
      setEditDialogOpen(false);
      resetEditForm();
      queryClient.invalidateQueries(["housing-units"] as any);
    },
    onError: (error: any) => {
      alert(
        error.message ||
          t("errors.failedToUpdateUnit") ||
          "Failed to update housing unit"
      );
    },
  });

  const { mutate: deleteUnit, isPending: isDeleting } = useMutation({
    mutationFn: ({
      societyId,
      housingId,
    }: {
      societyId: string;
      housingId: string;
    }) => deleteHousingUnitService(societyId, housingId),
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setDeleteError(null);
      queryClient.invalidateQueries(["housing-units"] as any);
    },
    onError: (error: any) => {
      setDeleteError(error.message || t("errors.failedToDeleteUnit"));
    },
  });

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    unit: HousingUnit
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenPenaltyDialog = () => {
    setPenaltyDialogOpen(true);
    handleMenuClose();
  };

  const handleOpenEditDialog = () => {
    if (!selectedUnit) return;

    // Reset form with current unit data
    resetEditForm({
      unit_number: selectedUnit.unit_number,
      unit_type: selectedUnit.unit_type,
      square_foot: selectedUnit.square_foot,
      current_maintenance: selectedUnit.current_maintenance,
    });

    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleViewUnit = () => {
    handleMenuClose();
    if (!selectedUnit) return;

    // Get the appropriate society ID for the selected unit
    const targetSocietyId = getSocietyIdForUnit(selectedUnit);

    if (!targetSocietyId) {
      alert(t("errors.noSocietyId"));
      return;
    }

    setViewUnitData({
      societyId: targetSocietyId,
      housingUnitId: selectedUnit.id,
      unitData: selectedUnit,
    });
    setViewUnitOpen(true);
  };

  const handleCloseUnitModal = () => {
    setViewUnitOpen(false);
    setViewUnitData(null);
  };

  const handleClosePenaltiesModal = () => {
    setViewPenaltiesOpen(false);
    setViewPenaltiesData(null);
  };

  // Helper function to get society ID for a unit
  const getSocietyIdForUnit = (unit: HousingUnit): string | null => {
    // Priority order:
    // 1. Direct society_id from unit
    // 2. society.id from nested society object
    // 3. localStorage societyId (for regular users)
    return (
      unit.society_id ||
      unit.society?.id ||
      (userRole !== "super_admin" ? societyId : null)
    );
  };

  const onEditSubmit = (data: EditHousingForm) => {
    if (!selectedUnit) return;

    const targetSocietyId = getSocietyIdForUnit(selectedUnit);
    if (!targetSocietyId) {
      alert(t("errors.noSocietyId"));
      return;
    }

    // Send all data since we're updating the unit
    updateUnit({
      societyId: targetSocietyId,
      housingId: selectedUnit.id,
      payload: data,
    });
  };

  const columns = useMemo(
    () => [
      {
        field: "unit_number",
        headerName: t("table.headers.unitNumber"),
        flex: 1,
      },
      {
        field: "unit_type",
        headerName: t("table.headers.unitType"),
        flex: 1,
      },
      {
        field: "square_foot",
        headerName: t("table.headers.squareFeet"),
        flex: 1,
      },
      // Show society name for super_admin
      ...(userRole === "super_admin"
        ? [
            {
              field: "society",
              headerName: t("table.headers.society"),
              flex: 1,
              renderCell: (params: any) => {
                const societyName =
                  params.row.society_name || t("common.unknown");
                return <span>{societyName}</span>;
              },
            },
          ]
        : []),
      {
        field: "is_occupied",
        headerName: t("table.headers.status"),
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params.value ? t("status.occupied") : t("status.vacant")}
            color={params.value ? "success" : "warning"}
            size="small"
          />
        ),
      },
      {
        field: "current_maintenance",
        headerName: t("table.headers.maintenance"),
        flex: 1,
        renderCell: (params: any) => {
          const value = Number(params.value) || 0;
          return value.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        },
      },
      {
        field: "actions",
        headerName: t("table.headers.actions"),
        sortable: false,
        renderCell: (params: any) => (
          <IconButton onClick={(e) => handleMenuOpen(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ],
    [t, userRole]
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleAddPenalty = () => {
    if (!penaltyAmount || !penaltyReason || !selectedUnit) {
      alert(t("errors.fillAllFields"));
      return;
    }

    // Get the appropriate society ID for the selected unit
    const targetSocietyId = getSocietyIdForUnit(selectedUnit);

    if (!targetSocietyId) {
      alert(t("errors.noSocietyId"));
      return;
    }

    addPenalty({
      societyId: targetSocietyId,
      housingUnitId: selectedUnit.id,
      payload: {
        amount: Number(penaltyAmount),
        reason: penaltyReason,
      },
    });
  };

  // Validation for penalty form
  const isPenaltyFormValid = () => {
    const amount = Number(penaltyAmount);
    return (
      amount > 0 &&
      penaltyReason.trim().length > 0 &&
      selectedUnit &&
      getSocietyIdForUnit(selectedUnit)
    );
  };

  const handleOpenDeleteDialog = () => {
    setDeleteError(null);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteUnit = () => {
    if (!selectedUnit) return;
    const targetSocietyId = getSocietyIdForUnit(selectedUnit);
    if (!targetSocietyId) {
      setDeleteError(t("errors.noSocietyId"));
      return;
    }
    deleteUnit({ societyId: targetSocietyId, housingId: selectedUnit.id });
  };

  return (
    <>
      <Box height="calc(100vh - 180px)">
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
            {t("actions.addHousingUnit")}
          </Button>
        </Box>

        <CommonDataGrid
          rows={housingUnits}
          columns={columns}
          loading={isLoading}
          height="calc(100vh - 180px)"
          pageSize={20}
        />

        <AddHousingUnitModal
          open={open}
          onClose={() => setOpen(false)}
          societyId={societyId}
          role={userRole}
        />

        {/* 3-dot Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewUnit}>{t("menu.viewUnit")}</MenuItem>
          <MenuItem
            onClick={handleOpenPenaltyDialog}
            disabled={!selectedUnit || !getSocietyIdForUnit(selectedUnit)}
          >
            {t("menu.addPenalty")}
          </MenuItem>
          <MenuItem
            onClick={handleOpenEditDialog}
            disabled={!selectedUnit || !getSocietyIdForUnit(selectedUnit)}
          >
            {t("menu.editUnit") || "Edit Unit"}
          </MenuItem>
          <MenuItem
            onClick={handleOpenDeleteDialog}
            disabled={!selectedUnit || !getSocietyIdForUnit(selectedUnit)}
          >
            {t("menu.deleteUnit") || "Delete Unit"}
          </MenuItem>
        </Menu>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => !isDeleting && setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            {t("delete.title") || "Delete Housing Unit"}
          </DialogTitle>
          <DialogContent>
            <p>
              {t("delete.confirmMessage") ||
                "Are you sure you want to delete this unit?"}
            </p>
            {deleteError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {deleteError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={isDeleting}
              onClick={handleDeleteUnit}
            >
              {isDeleting
                ? t("actions.deleting") || "Deleting..."
                : t("actions.delete")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Housing Unit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => !isUpdating && setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t("edit.title") || "Edit Housing Unit"}</DialogTitle>
          <DialogContent>
            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <Controller
                name="unit_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("edit.unitNumber") || "Unit Number"}
                    fullWidth
                    disabled={isUpdating}
                    error={!!editErrors.unit_number}
                    helperText={editErrors.unit_number?.message}
                    placeholder="Enter unit number"
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
                    label={t("edit.unitType") || "Unit Type"}
                    fullWidth
                    disabled={isUpdating}
                    error={!!editErrors.unit_type}
                    helperText={editErrors.unit_type?.message}
                  >
                    <MenuItem value="Bungalows">Bungalows</MenuItem>
                    <MenuItem value="Raw House">Raw House</MenuItem>
                    <MenuItem value="Villas">Villas</MenuItem>
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
                    label={t("edit.squareFoot") || "Square Foot"}
                    fullWidth
                    disabled={isUpdating}
                    value={value === 0 ? "" : value}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(val === "" ? 0 : parseInt(val, 10));
                    }}
                    error={!!editErrors.square_foot}
                    helperText={editErrors.square_foot?.message}
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
                    label={
                      t("edit.currentMaintenance") || "Current Maintenance"
                    }
                    fullWidth
                    disabled={isUpdating}
                    value={value === 0 ? "" : value}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(val === "" ? 0 : parseFloat(val));
                    }}
                    error={!!editErrors.current_maintenance}
                    helperText={editErrors.current_maintenance?.message}
                    inputProps={{ min: 0, step: 1 }}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={isUpdating}
              sx={{ bgcolor: "#1e1ee4" }}
              onClick={handleSubmit(onEditSubmit)}
            >
              {isUpdating
                ? t("actions.saving") || "Saving..."
                : t("actions.save") || "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Penalty Dialog */}
        <Dialog
          open={penaltyDialogOpen}
          onClose={() => setPenaltyDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t("penalty.title")}</DialogTitle>
          <DialogContent>
            {/* Show warning for super admin if no society ID */}
            {userRole === "super_admin" &&
              selectedUnit &&
              !getSocietyIdForUnit(selectedUnit) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {t("warnings.superAdminNoSociety")}
                </Alert>
              )}
            <TextField
              label={t("penalty.amount")}
              type="number"
              fullWidth
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              placeholder={t("penalty.amountPlaceholder")}
              InputProps={{ inputProps: { min: 0 } }}
              error={penaltyAmount !== "" && Number(penaltyAmount) <= 0}
              helperText={
                penaltyAmount !== "" && Number(penaltyAmount) <= 0
                  ? t("errors.validAmount")
                  : ""
              }
            />
            <TextField
              label={t("penalty.reason")}
              fullWidth
              multiline
              rows={3}
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
              placeholder={t("penalty.reasonPlaceholder")}
              error={penaltyReason !== "" && penaltyReason.trim().length === 0}
              helperText={
                penaltyReason !== "" && penaltyReason.trim().length === 0
                  ? t("errors.validReason")
                  : ""
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPenaltyDialogOpen(false)}>
              {t("actions.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={isPending || !isPenaltyFormValid()}
              sx={{ bgcolor: "#1e1ee4" }}
              onClick={handleAddPenalty}
            >
              {isPending ? t("actions.saving") : t("actions.addPenalty")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Unit Modal */}
        <ViewHousingUnitModal
          open={viewUnitOpen}
          onClose={handleCloseUnitModal}
          selectedUnit={viewUnitData}
        />
      </Box>
    </>
  );
}
