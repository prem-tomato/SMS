"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddHousingUnitModal from "@/components/housing/AddHousingUnitModal";
import { ViewHousingUnitModal } from "@/components/housing/ViewHousingUnitPenaltiesModal";
import { getSocietyIdFromLocalStorage } from "@/lib/auth";
import { fetchAllHousingUnits } from "@/services/housing";
import { addPenaltyForUnit } from "@/services/housing-unit-penalty";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
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

export default function HousingUnitsPage() {
  const [open, setOpen] = useState(false);
  const [societyId, setSocietyId] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
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

  const queryClient = useQueryClient();

  useEffect(() => {
    const storedSocietyId = getSocietyIdFromLocalStorage();
    if (storedSocietyId) {
      setSocietyId(storedSocietyId);
    }
  }, []);

  const {
    data: housingUnits = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["housing-units"],
    queryFn: fetchAllHousingUnits,
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
      alert(error.message || "Failed to add penalty");
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, unit: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenPenaltyDialog = () => {
    setPenaltyDialogOpen(true);
    handleMenuClose();
  };

  const handleViewUnit = () => {
    handleMenuClose();
    if (!selectedUnit || !societyId) return;

    setViewUnitData({
      societyId: societyId,
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

  const columns = useMemo(
    () => [
      { field: "unit_number", headerName: "Unit Number", flex: 1 },
      { field: "unit_type", headerName: "Unit Type", flex: 1 },
      { field: "square_foot", headerName: "Sq. Ft", flex: 1 },
      {
        field: "current_maintenance",
        headerName: "Maintenance",
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
          <IconButton onClick={(e) => handleMenuOpen(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ],
    []
  );

  const handleOpen = () => {
    setOpen(true);
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
            Add Housing Unit
          </Button>
        </Box>

        <CommonDataGrid
          rows={housingUnits}
          columns={columns}
          loading={isLoading}
          height="calc(100vh - 180px)"
          pageSize={20}
        />

        <AddHousingUnitModal open={open} onClose={() => setOpen(false)} />

        {/* 3-dot Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewUnit}>View Unit</MenuItem>
          <MenuItem onClick={handleOpenPenaltyDialog}>Add Penalty</MenuItem>
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
              disabled={isPending || !penaltyAmount || !penaltyReason}
              sx={{ bgcolor: "#1e1ee4" }}
              onClick={() =>
                addPenalty({
                  societyId: societyId,
                  housingUnitId: selectedUnit.id,
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
