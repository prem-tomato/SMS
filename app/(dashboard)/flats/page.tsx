"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import EditFlatModal from "@/components/flat/EditFlatModel";
import AddFlatModal from "@/components/flat/FlatModel";
import { ManagePendingMaintenanceModal } from "@/components/flat/ManagePendingMaintenanceModal";
import { ViewFlatModal } from "@/components/flat/ViewFlatModal";
import { ViewMaintenanceModal } from "@/components/flat/ViewMaintenanceModal";
import {
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
  getUserRole,
} from "@/lib/auth";
import {
  addFlatPenalty,
  deleteFlatService,
  listAllFlats,
  listAllFlatsBySociety,
} from "@/services/flats";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
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
import toast from "react-hot-toast";

export default function FlatsPage() {
  const t = useTranslations("FlatsPage");

  const [addModal, setAddModal] = useState(false);
  const [societyId, setSocietyId] = useState("");
  const [role, setRole] = useState("");
  const [societyType, setSocietyType] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFlat, setEditFlat] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFlat, setSelectedFlat] = useState<any>(null);
  const [penaltyDialogOpen, setPenaltyDialogOpen] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("");

  // Updated view dialog state to work with ViewFlatModal
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewFlatData, setViewFlatData] = useState<{
    societyId: string;
    buildingId: string;
    flatId: string;
  } | null>(null);

  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceFlatData, setMaintenanceFlatData] = useState<{
    societyId: string;
    buildingId: string;
    flatId: string;
  } | null>(null);

  const [viewMaintenanceOpen, setViewMaintenanceOpen] = useState(false);
  const [viewMaintenanceData, setViewMaintenanceData] = useState<{
    societyId: string;
    buildingId: string;
    flatId: string;
  } | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const userRole = getUserRole();
    const storedSocietyId = getSocietyIdFromLocalStorage();
    const storedSocietyType = getSocietyTypeFromLocalStorage();
    setRole(userRole!);
    if (userRole === "admin") {
      setSocietyId(storedSocietyId!);
      setSocietyType(storedSocietyType!);
    }
  }, []);

  const { data: flats = [], isLoading } = useQuery({
    queryKey: ["flats", societyId],
    queryFn: () =>
      role === "super_admin"
        ? listAllFlats()
        : listAllFlatsBySociety(societyId),
    enabled: role === "super_admin" || !!societyId,
  });

  const { mutate: addPenalty, isPending } = useMutation({
    mutationFn: ({
      societyId,
      buildingId,
      flatId,
      payload,
    }: {
      societyId: string;
      buildingId: string;
      flatId: string;
      payload: { amount: number; reason: string };
    }) => addFlatPenalty(societyId, buildingId, flatId, payload),
    onSuccess: () => {
      setPenaltyDialogOpen(false);
      setPenaltyAmount("");
      setPenaltyReason("");
      queryClient.invalidateQueries(["flats", societyId] as any);
    },
    onError: (error: any) => {
      alert(error.message || t("errors.failedAddPenalty"));
    },
  });

  const { mutate: deleteFlat, isPending: isDeleting } = useMutation({
    mutationFn: ({
      societyId,
      buildingId,
      flatId,
    }: {
      societyId: string;
      buildingId: string;
      flatId: string;
    }) => deleteFlatService(societyId, buildingId, flatId),
    onSuccess: () => {
      queryClient.invalidateQueries(["flats", societyId] as any);
      toast.success(t("messages.flatDeleted"));
      setDeleteDialogOpen(false);
      setDeleteError(null);
    },
    onError: (error: any) => {
      // Instead of toast, show inside dialog
      setDeleteError(error.message || t("errors.failedDeleteFlat"));
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, flat: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedFlat(flat);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenPenaltyDialog = () => {
    setPenaltyDialogOpen(true);
    handleMenuClose();
  };

  // Updated handleViewFlat to work with ViewFlatModal
  const handleViewFlat = () => {
    handleMenuClose();
    if (!selectedFlat) return;

    setViewFlatData({
      societyId: selectedFlat.society_id,
      buildingId: selectedFlat.building_id,
      flatId: selectedFlat.id,
    });
    setViewDialogOpen(true);
  };

  // Handle closing the view modal
  const handleCloseViewModal = () => {
    setViewDialogOpen(false);
    setViewFlatData(null);
  };

  const handleManageMaintenance = () => {
    handleMenuClose();
    if (!selectedFlat) return;
    setMaintenanceFlatData({
      societyId: selectedFlat.society_id,
      buildingId: selectedFlat.building_id,
      flatId: selectedFlat.id,
    });
    setMaintenanceModalOpen(true);
  };

  const handleViewMaintenance = () => {
    handleMenuClose();
    if (!selectedFlat) return;
    setViewMaintenanceData({
      societyId: selectedFlat.society_id,
      buildingId: selectedFlat.building_id,
      flatId: selectedFlat.id,
    });
    setViewMaintenanceOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        field: "flat_number",
        headerName:
          societyType === "commercial"
            ? t("columns.shopNo")
            : t("columns.flatNo"),
        flex: 1,
      },
      { field: "floor_number", headerName: t("columns.floor"), flex: 1 },
      {
        field: "is_occupied",
        headerName: t("columns.status"),
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params.value ? t("status.occupied") : t("status.vacant")}
            color={params.value ? "success" : "warning"}
            size="small"
          />
        ),
      },
      { field: "building_name", headerName: t("columns.building"), flex: 1 },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: t("columns.society"), flex: 1 }]
        : []),
      {
        field: "current_maintenance",
        headerName: t("columns.currentMaintenance"),
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
        headerName: t("columns.actions"),
        sortable: false,
        renderCell: (params: any) => (
          <>
            {" "}
            <IconButton onClick={(e) => handleMenuOpen(e, params.row)}>
              <MoreVertIcon />
            </IconButton>
          </>
        ),
      },
    ],
    [role, societyType, t]
  );

  return (
    <Box height="calc(100vh - 180px)">
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setAddModal(true)}
          startIcon={<AddIcon />}
          sx={{ borderRadius: 1, borderColor: "#1e1ee4", color: "#1e1ee4" }}
        >
          {societyType === "commercial"
            ? t("buttons.addShop")
            : t("buttons.addFlat")}
        </Button>
      </Box>

      <CommonDataGrid
        rows={flats}
        columns={columns}
        loading={isLoading}
        height="calc(100vh - 180px)"
        pageSize={20}
      />

      <AddFlatModal
        open={addModal}
        onClose={() => setAddModal(false)}
        role={role}
        societyId={societyId}
      />

      <EditFlatModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditFlat(null);
        }}
        flat={editFlat}
      />

      {/* 3-dot Action Menu */}
      {/* <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewFlat}>
          {societyType === "commercial"
            ? t("menu.viewShop")
            : t("menu.viewFlat")}
        </MenuItem>
        <MenuItem onClick={handleOpenPenaltyDialog}>
          {t("menu.addPenalty")}
        </MenuItem>
        <MenuItem onClick={handleManageMaintenance}>
          {t("menu.maintenanceSettings")}
        </MenuItem>
        <MenuItem onClick={handleViewMaintenance}>
          {t("menu.maintenanceOverview")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setEditFlat(selectedFlat);
            setEditModalOpen(true);
          }}
        >
          {t("menu.editFlat")}
        </MenuItem>
      </Menu> */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewFlat}>
          {societyType === "commercial"
            ? t("menu.viewShop")
            : t("menu.viewFlat")}
        </MenuItem>
        <MenuItem onClick={handleOpenPenaltyDialog}>
          {t("menu.addPenalty")}
        </MenuItem>
        <MenuItem onClick={handleManageMaintenance}>
          {t("menu.maintenanceSettings")}
        </MenuItem>
        <MenuItem onClick={handleViewMaintenance}>
          {t("menu.maintenanceOverview")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setEditFlat(selectedFlat);
            setEditModalOpen(true);
          }}
        >
          {t("menu.editFlat")}
        </MenuItem>
        {/* 🗑 Delete Flat option */}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setDeleteDialogOpen(true);
            setDeleteError(null);
          }}
          style={{ color: "red" }}
        >
          {t("menu.deleteFlat")}
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
        <DialogContent>
          <p>
            {t("deleteDialog.message", {
              flat: selectedFlat?.flat_number,
            })}
          </p>
          {deleteError && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: "#fdecea",
                color: "#b71c1c",
                borderRadius: 1,
              }}
            >
              {deleteError}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting}
            onClick={() =>
              deleteFlat({
                societyId: selectedFlat.society_id,
                buildingId: selectedFlat.building_id,
                flatId: selectedFlat.id,
              })
            }
          >
            {isDeleting ? t("common.deleting") : t("deleteDialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Penalty Dialog */}
      <Dialog
        open={penaltyDialogOpen}
        onClose={() => setPenaltyDialogOpen(false)}
      >
        <DialogTitle>{t("penaltyDialog.title")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("penaltyDialog.amount")}
            type="number"
            fullWidth
            value={penaltyAmount}
            onChange={(e) => setPenaltyAmount(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label={t("penaltyDialog.reason")}
            fullWidth
            value={penaltyReason}
            onChange={(e) => setPenaltyReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPenaltyDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            disabled={isPending}
            sx={{ bgcolor: "#1e1ee4" }}
            onClick={() =>
              addPenalty({
                societyId: selectedFlat.society_id,
                buildingId: selectedFlat.building_id,
                flatId: selectedFlat.id,
                payload: {
                  amount: Number(penaltyAmount),
                  reason: penaltyReason,
                },
              })
            }
          >
            {isPending ? t("common.saving") : t("penaltyDialog.add")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Flat Modal */}
      <ViewFlatModal
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        selectedFlat={viewFlatData}
        societyType={societyType}
      />

      <ManagePendingMaintenanceModal
        open={maintenanceModalOpen}
        onClose={() => {
          setMaintenanceModalOpen(false);
          setMaintenanceFlatData(null);
        }}
        selectedFlat={maintenanceFlatData}
        societyType={societyType}
      />

      <ViewMaintenanceModal
        open={viewMaintenanceOpen}
        onClose={() => {
          setViewMaintenanceOpen(false);
          setViewMaintenanceData(null);
        }}
        selectedFlat={viewMaintenanceData}
      />
    </Box>
  );
}
