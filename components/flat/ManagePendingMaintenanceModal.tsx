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
import { useTranslations } from "next-intl";
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
  societyType: string | null;
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
  societyType,
}: Props) => {
  const t = useTranslations("maintenance-modal");
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

  // Helper function to get society type label
  const getSocietyTypeLabel = (type: string | null) => {
    if (type === "residential") {
      return { singular: t("flat"), plural: t("resident") };
    }
    return { singular: t("shop"), plural: t("shop") };
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
      showToast(t("errors.selectMaintenanceRecord"), "warning");
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
        showToast(t("errors.validSettlementAmount"), "error");
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
          t("errors.validAmountsForMonths", { count: requiredCount }),
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

      showToast(t("messages.maintenanceUpdatedSuccess"), "success");

      // Close modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating maintenance:", err);
      showToast(
        t("errors.updateFailed", {
          error: err?.message || t("errors.generic"),
        }),
        "error"
      );
    }
  };

  // Get month count for current amount type
  const getMonthCount = () => {
    return amountType === "quarterly"
      ? 3
      : amountType === "halfyearly"
      ? 6
      : 12;
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography>{t("states.loadingMaintenanceRecords")}</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state - simplified
  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("titles.error")}</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            {t("errors.failedToLoadRecords", {
              type: getSocietyTypeLabel(societyType).plural,
            })}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("actions.close")}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Check if data exists
  if (!data?.data) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("titles.noData")}</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            {t("messages.noDataAvailable", {
              type: getSocietyTypeLabel(societyType).plural,
            })}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("actions.close")}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // No maintenance records found
  if (maintenances.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("titles.noMaintenanceRecords")}</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            {t("messages.noMaintenanceRecords", {
              type: getSocietyTypeLabel(societyType).singular,
            })}
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
            {t("actions.close")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Main modal content
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("titles.managePendingMaintenance")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {getSocietyTypeLabel(societyType).singular}:{" "}
            <strong>{data.data.flat_number || t("common.notAvailable")}</strong>{" "}
            | {t("labels.building")}:{" "}
            <strong>
              {data.data.building_name || t("common.notAvailable")}
            </strong>
          </Typography>

          {/* Step 1: Select Maintenance Record */}
          {!selectedMaintenanceId ? (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t("steps.selectMaintenanceRecord")}
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
                          - {record.reason || t("common.noReasonProvided")}
                        </Box>
                      }
                      secondary={
                        <>
                          {t("labels.id")}:{" "}
                          {record.id?.slice(0, 8) || t("common.notAvailable")}
                          ... | {t("labels.by")}:{" "}
                          {record.action_by || t("common.unknown")} |{" "}
                          {record.created_at
                            ? new Date(record.created_at).toLocaleDateString()
                            : t("common.notAvailable")}
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
                {t("labels.editingMaintenanceId")}:{" "}
                <strong>{selectedMaintenanceId.slice(0, 8)}...</strong>
                <br />
                {t("labels.originalAmount")}:{" "}
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
                  label={t("amountTypes.settlement")}
                />
                <FormControlLabel
                  value="quarterly"
                  control={<Radio />}
                  label={t("amountTypes.quarterly")}
                />
                <FormControlLabel
                  value="halfyearly"
                  control={<Radio />}
                  label={t("amountTypes.halfYearly")}
                />
                <FormControlLabel
                  value="yearly"
                  control={<Radio />}
                  label={t("amountTypes.yearly")}
                />
              </RadioGroup>

              {amountType === "settlement" ? (
                <TextField
                  label={t("labels.settlementAmount")}
                  type="number"
                  fullWidth
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder={t("placeholders.settlementAmount")}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              ) : (
                <Box>
                  <Typography variant="body1" fontWeight="500" sx={{ mb: 1 }}>
                    {t("labels.enterAmountsForMonths", {
                      count: getMonthCount(),
                    })}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {t("labels.total")}: ₹
                    {monthlyAmounts
                      .slice(0, getMonthCount())
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
                    {monthlyAmounts.slice(0, getMonthCount()).map((item) => (
                      <TextField
                        key={item.month}
                        label={t("labels.month", { month: item.month })}
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
          <Button onClick={onClose}>{t("actions.cancel")}</Button>

          {/* Conditional Button */}
          {!selectedMaintenanceId ? (
            <Button
              variant="contained"
              onClick={handleConfirmSelection}
              disabled={!selectedMaintenanceId}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              {t("actions.next")}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleConfirmUpdate}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              {t("actions.updateMaintenance")}
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
