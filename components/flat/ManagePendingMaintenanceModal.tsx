// src/components/flat/ManagePendingMaintenanceModal.tsx
"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getParticularFlat } from "@/services/flats";
import { manageFlatMaintenance } from "@/services/manage-flat-maintenance";

interface MonthAmount {
  month: number;
  amount: number;
}

interface MaintenanceRecord {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
  action_by: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  selectedFlat: {
    societyId: string;
    buildingId: string;
    flatId: string;
  } | null;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const monthsList = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12

export const ManagePendingMaintenanceModal = ({
  open,
  onClose,
  selectedFlat,
}: Props) => {
  const queryClient = useQueryClient();

  // Step 1: Select maintenance record
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<
    string | null
  >(null);

  // Step 2: Form inputs
  const [amountType, setAmountType] = useState<
    "settlement" | "quarterly" | "halfyearly" | "yearly"
  >("settlement");
  const [settlementAmount, setSettlementAmount] = useState<string>("");
  const [monthlyAmounts, setMonthlyAmounts] = useState<MonthAmount[]>([]);

  // Toast state
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  // Helper function to show toast
  const showToast = (
    message: string,
    severity: ToastState["severity"] = "info"
  ) => {
    setToast({ open: true, message, severity });
  };

  // Helper function to close toast
  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Fetch flat data - simplified to match ViewFlatModal pattern
  const enabled = open && !!selectedFlat;

  const { data, isLoading, error } = useQuery({
    queryKey: ["particular-flat", selectedFlat?.flatId],
    queryFn: () =>
      getParticularFlat(
        selectedFlat!.societyId,
        selectedFlat!.buildingId,
        selectedFlat!.flatId
      ),
    enabled,
  });

  // Safely extract maintenances with fallback - exactly like ViewFlatModal
  const maintenances: MaintenanceRecord[] = data?.data?.maintenances || [];

  // Reset all states when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedMaintenanceId(null);
      setAmountType("settlement");
      setSettlementAmount("");
      setMonthlyAmounts(monthsList.map((month) => ({ month, amount: 0 })));
      // Close any existing toast when modal opens
      setToast({ open: false, message: "", severity: "info" });
    }
  }, [open]);

  // Auto-distribute amount when maintenance record is selected and amount type changes
  useEffect(() => {
    if (selectedMaintenanceId && amountType !== "settlement") {
      const selectedMaintenance = maintenances.find(
        (m) => m.id === selectedMaintenanceId
      );
      if (selectedMaintenance) {
        const totalAmount = selectedMaintenance.amount;
        const monthCount =
          amountType === "quarterly" ? 3 : amountType === "halfyearly" ? 6 : 12;
        const amountPerMonth = Math.floor(totalAmount / monthCount);
        const remainder = totalAmount % monthCount;

        const distributedAmounts = monthsList.map((month) => {
          if (month <= monthCount) {
            // Add remainder to the last month to ensure total matches exactly
            const extraAmount = month === monthCount ? remainder : 0;
            return { month, amount: amountPerMonth + extraAmount };
          }
          return { month, amount: 0 };
        });

        setMonthlyAmounts(distributedAmounts);
      }
    }
  }, [selectedMaintenanceId, amountType, maintenances]);

  const handleConfirmSelection = () => {
    if (!selectedMaintenanceId) {
      showToast("Please select a maintenance record to manage.", "warning");
      return;
    }

    // Auto-populate settlement amount when a maintenance record is selected
    const selectedMaintenance = maintenances.find(
      (m) => m.id === selectedMaintenanceId
    );
    if (selectedMaintenance && amountType === "settlement") {
      setSettlementAmount(selectedMaintenance.amount.toString());
    }
  };

  const handleConfirmUpdate = async () => {
    if (!selectedMaintenanceId || !selectedFlat) return;

    let payload: any;

    if (amountType === "settlement") {
      const amount = Number(settlementAmount);
      if (isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid settlement amount.", "error");
        return;
      }
      payload = {
        amount_type: "settlement",
        settlement_amount: amount,
      };
    } else {
      const requiredCount =
        amountType === "quarterly" ? 3 : amountType === "halfyearly" ? 6 : 12;
      const filled = monthlyAmounts
        .slice(0, requiredCount)
        .map((item) => ({ ...item, amount: Number(item.amount) }))
        .filter((item) => item.amount > 0);

      if (filled.length !== requiredCount) {
        showToast(
          `Please provide valid amounts for all ${requiredCount} months.`,
          "error"
        );
        return;
      }

      payload = {
        amount_type: amountType,
        months: filled,
      };
    }

    try {
      await manageFlatMaintenance(selectedMaintenanceId, payload);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["particular-flat", selectedFlat.flatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["flats", selectedFlat.societyId],
      });

      showToast("Maintenance updated successfully!", "success");

      // Close modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating maintenance:", err);
      showToast(
        `Error: ${err?.message || "Failed to update maintenance"}`,
        "error"
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography>Loading maintenance records...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state - simplified
  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Alert severity="error">Failed to load flat details.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Check if data exists
  if (!data?.data) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>No Data</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            No flat data available. Please try again.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // No maintenance records found
  if (maintenances.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>No Maintenance Records</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            No maintenance records found for this flat. Cannot manage pending
            maintenance.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: "#1e1ee4",
              "&:hover": {
                backgroundColor: "#1717c9",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Main modal content
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Pending Maintenance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Flat: <strong>{data.data.flat_number || "N/A"}</strong> | Building:{" "}
            <strong>{data.data.building_name || "N/A"}</strong>
          </Typography>

          {/* Step 1: Select Maintenance Record */}
          {!selectedMaintenanceId ? (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Select Maintenance Record
              </Typography>
              <List
                sx={{
                  maxHeight: 300,
                  overflow: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                }}
              >
                {maintenances.map((record) => (
                  <ListItem
                    key={record.id}
                    secondaryAction={
                      <Radio
                        checked={selectedMaintenanceId === record.id}
                        onChange={() => setSelectedMaintenanceId(record.id)}
                      />
                    }
                    sx={{ cursor: "pointer" }}
                    onClick={() => setSelectedMaintenanceId(record.id)}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <strong>
                            ₹{(record.amount || 0).toLocaleString()}
                          </strong>{" "}
                          - {record.reason || "No reason provided"}
                        </Box>
                      }
                      secondary={
                        <>
                          ID: {record.id?.slice(0, 8) || "N/A"}... | By:{" "}
                          {record.action_by || "Unknown"} |{" "}
                          {record.created_at
                            ? new Date(record.created_at).toLocaleDateString()
                            : "N/A"}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            /* Step 2: Edit Maintenance Type */
            <>
              <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                Editing Maintenance ID:{" "}
                <strong>{selectedMaintenanceId.slice(0, 8)}...</strong>
                <br />
                Original Amount:{" "}
                <strong>
                  ₹
                  {maintenances
                    .find((m) => m.id === selectedMaintenanceId)
                    ?.amount.toLocaleString()}
                </strong>
              </Typography>

              {/* Amount Type Selection */}
              <RadioGroup
                row
                value={amountType}
                onChange={(e) => setAmountType(e.target.value as any)}
                sx={{ mb: 3 }}
              >
                <FormControlLabel
                  value="settlement"
                  control={<Radio />}
                  label="Settlement"
                />
                <FormControlLabel
                  value="quarterly"
                  control={<Radio />}
                  label="Quarterly"
                />
                <FormControlLabel
                  value="halfyearly"
                  control={<Radio />}
                  label="Half-Yearly"
                />
                <FormControlLabel
                  value="yearly"
                  control={<Radio />}
                  label="Yearly"
                />
              </RadioGroup>

              {amountType === "settlement" ? (
                <TextField
                  label="Settlement Amount"
                  type="number"
                  fullWidth
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              ) : (
                <Box>
                  <Typography variant="body1" fontWeight="500" sx={{ mb: 1 }}>
                    Enter Amounts for{" "}
                    {amountType === "quarterly"
                      ? 3
                      : amountType === "halfyearly"
                      ? 6
                      : 12}{" "}
                    Months
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Total: ₹
                    {monthlyAmounts
                      .slice(
                        0,
                        amountType === "quarterly"
                          ? 3
                          : amountType === "halfyearly"
                          ? 6
                          : 12
                      )
                      .reduce(
                        (sum, item) => sum + (Number(item.amount) || 0),
                        0
                      )
                      .toLocaleString()}
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: 1,
                    }}
                  >
                    {monthlyAmounts
                      .slice(
                        0,
                        amountType === "quarterly"
                          ? 3
                          : amountType === "halfyearly"
                          ? 6
                          : 12
                      )
                      .map((item) => (
                        <TextField
                          key={item.month}
                          label={`Month ${item.month}`}
                          type="number"
                          size="small"
                          value={item.amount || ""}
                          onChange={(e) => {
                            const newVal = Number(e.target.value);
                            setMonthlyAmounts((prev) =>
                              prev.map((m) =>
                                m.month === item.month
                                  ? { ...m, amount: isNaN(newVal) ? 0 : newVal }
                                  : m
                              )
                            );
                          }}
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      ))}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: "#1e1ee4",
              "&:hover": {
                backgroundColor: "#1717c9",
              },
            }}
          >
            Cancel
          </Button>

          {/* Conditional Button */}
          {!selectedMaintenanceId ? (
            <Button
              variant="contained"
              onClick={handleConfirmSelection}
              disabled={!selectedMaintenanceId}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleConfirmUpdate}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              Update Maintenance
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};
