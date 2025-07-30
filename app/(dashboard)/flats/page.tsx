"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddFlatModal from "@/components/flat/FlatModel";
import { ManagePendingMaintenanceModal } from "@/components/flat/ManagePendingMaintenanceModal";
import { ViewFlatModal } from "@/components/flat/ViewFlatModal"; // Import the ViewFlatModal
import { ViewMaintenanceModal } from "@/components/flat/ViewMaintenanceModal";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  addFlatPenalty,
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
import { useEffect, useMemo, useState } from "react";

export default function FlatsPage() {
  const [addModal, setAddModal] = useState(false);
  const [societyId, setSocietyId] = useState("");
  const [role, setRole] = useState("");

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
    setRole(userRole!);
    if (userRole === "admin") setSocietyId(storedSocietyId!);
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
      alert(error.message || "Failed to add penalty");
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
      { field: "flat_number", headerName: "Flat No", flex: 1 },
      { field: "floor_number", headerName: "Floor", flex: 1 },
      {
        field: "is_occupied",
        headerName: "Status",
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params.value ? "Occupied" : "Vacant"}
            color={params.value ? "success" : "warning"}
            size="small"
          />
        ),
      },
      { field: "building_name", headerName: "Building", flex: 1 },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: "Society", flex: 1 }]
        : []),
      {
        field: "current_maintenance",
        headerName: "Current Maintenance",
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
        headerName: "Actions",
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
    [role]
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
          Add Flat
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

      {/* 3-dot Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewFlat}>View</MenuItem>
        <MenuItem onClick={handleOpenPenaltyDialog}>Add Penalty</MenuItem>
        <MenuItem onClick={handleManageMaintenance}>
          Manage Maintenance
        </MenuItem>
        <MenuItem onClick={handleViewMaintenance}>View Maintenance</MenuItem>
      </Menu>

      {/* Penalty Dialog */}
      <Dialog
        open={penaltyDialogOpen}
        onClose={() => setPenaltyDialogOpen(false)}
      >
        <DialogTitle>Add Penalty</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={penaltyAmount}
            onChange={(e) => setPenaltyAmount(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Reason"
            fullWidth
            value={penaltyReason}
            onChange={(e) => setPenaltyReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPenaltyDialogOpen(false)}>Cancel</Button>
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
            {isPending ? "Saving..." : "Add Penalty"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Flat Modal */}
      <ViewFlatModal
        open={viewDialogOpen}
        onClose={handleCloseViewModal}
        selectedFlat={viewFlatData}
      />

      <ManagePendingMaintenanceModal
        open={maintenanceModalOpen}
        onClose={() => {
          setMaintenanceModalOpen(false);
          setMaintenanceFlatData(null);
        }}
        selectedFlat={maintenanceFlatData}
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
