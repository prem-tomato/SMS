"use client";

import { ViewHousingUnitPenalty } from "@/app/api/socities/socities.types";
import {
  listPenaltiesForUnit,
  removePenaltyForUnit,
  updatePenaltyForUnit,
} from "@/services/housing-unit-penalty";
import { Close as CloseIcon } from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface HousingUnit {
  id: string;
  unit_number: string;
  unit_type: string;
  square_foot: number;
  current_maintenance: number;
  is_occupied?: boolean;
  society_name?: string;
  building_name?: string;
}

interface ViewHousingUnitModalProps {
  open: boolean;
  onClose: () => void;
  selectedUnit: {
    societyId: string;
    housingUnitId: string;
    unitData?: HousingUnit;
  } | null;
}

export function ViewHousingUnitModal({
  open,
  onClose,
  selectedUnit,
}: ViewHousingUnitModalProps) {
  const t = useTranslations("ViewHousingUnitModal");
  
  const enabled = open && !!selectedUnit;

  const {
    data: penaltiesResponse,
    isLoading: penaltiesLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["housing-unit-penalties", selectedUnit?.housingUnitId],
    queryFn: () =>
      listPenaltiesForUnit(
        selectedUnit!.societyId,
        selectedUnit!.housingUnitId
      ),
    enabled,
  });

  // Extract penalties from the response - handle both direct array and response object
  const penalties = Array.isArray(penaltiesResponse)
    ? penaltiesResponse
    : penaltiesResponse?.data || [];

  // Preserve the penalties data even when modal is closing
  const [preservedPenalties, setPreservedPenalties] = useState<
    ViewHousingUnitPenalty[]
  >([]);
  const [preservedUnit, setPreservedUnit] = useState<HousingUnit | null>(null);

  // Fix: Use penaltiesResponse and selectedUnit.housingUnitId as dependencies
  // This ensures consistent dependency array size
  useEffect(() => {
    // Preserve the penalties data
    if (penalties && penalties.length >= 0) {
      setPreservedPenalties(penalties);
    }
    // Preserve unit data
    if (selectedUnit?.unitData) {
      setPreservedUnit(selectedUnit.unitData);
    }
  }, [penaltiesResponse, selectedUnit?.housingUnitId]);

  // Use preserved data if available, otherwise use current data
  const displayPenalties = preservedPenalties || penalties;
  const unit = preservedUnit || selectedUnit?.unitData;

  const markAsPaidMutation = useMutation({
    mutationFn: ({ penaltyId }: { penaltyId: string }) =>
      updatePenaltyForUnit(
        selectedUnit!.societyId,
        selectedUnit!.housingUnitId,
        penaltyId
      ),
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      alert(error.message || t("errors.markPaidFailed"));
    },
  });

  const removePenaltyMutation = useMutation({
    mutationFn: ({ penaltyId }: { penaltyId: string }) =>
      removePenaltyForUnit(
        selectedUnit!.societyId,
        selectedUnit!.housingUnitId,
        penaltyId
      ),
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      alert(error.message || t("errors.removePenaltyFailed"));
    },
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const handleMarkAsPaid = async (penaltyId: string) => {
    markAsPaidMutation.mutate({ penaltyId });
  };

  const handleRemovePenalty = async (penaltyId: string) => {
      removePenaltyMutation.mutate({ penaltyId });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionProps={{
        timeout: {
          enter: 200,
          exit: 150,
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="600" color="text.primary">
            {t("title")}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {unit && (
          <Box>
            {/* Basic Info */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                {t("sections.basicInfo")}
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("fields.unitNumber")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2" fontWeight="600">
                        {unit.unit_number}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("fields.unitType")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2">{unit.unit_type}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("fields.status")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Chip
                        label={unit.is_occupied ? t("status.occupied") : t("status.vacant")}
                        color={unit.is_occupied ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("fields.area")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2">
                        {unit.square_foot ? `${unit.square_foot} ${t("units.sqFt")}` : t("common.notAvailable")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            {/* Property Details */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                {t("sections.propertyInfo")}
              </Typography>
              <Table size="small">
                <TableBody>
                  {unit.building_name && (
                    <TableRow>
                      <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("fields.building")}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 0, py: 1 }}>
                        <Typography variant="body2">
                          {unit.building_name}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {unit.society_name && (
                    <TableRow>
                      <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("fields.society")}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 0, py: 1 }}>
                        <Typography variant="body2">
                          {unit.society_name}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("fields.currentMaintenance")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color="primary.main"
                      >
                        {formatCurrency(unit.current_maintenance)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            {/* Penalties */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                {t("sections.penalties")}
              </Typography>
              {!displayPenalties || displayPenalties.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("penalties.noPenalties")}
                </Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {displayPenalties
                      .filter(
                        (penalty: ViewHousingUnitPenalty) => !penalty.is_deleted
                      )
                      .map((penalty: ViewHousingUnitPenalty) => (
                        <TableRow key={penalty.id}>
                          {/* Amount */}
                          <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              color={
                                penalty.is_paid ? "success.main" : "error.main"
                              }
                            >
                              {formatCurrency(penalty.amount)}
                            </Typography>
                            {penalty.is_paid && (
                              <Typography
                                variant="caption"
                                color="success.main"
                                display="block"
                              >
                                {t("penalties.paid")}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Reason + Metadata */}
                          <TableCell sx={{ border: 0, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {penalty.reason}
                            </Typography>
                          </TableCell>

                          {/* Created At */}
                          <TableCell sx={{ border: 0, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {dayjs(penalty.created_at).format("DD-MM-YYYY")}
                            </Typography>
                            {penalty.is_paid && penalty.paid_at && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {t("penalties.paidOn")}:{" "}
                                {dayjs(penalty.paid_at).format("DD-MM-YYYY")}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Action By */}
                          <TableCell sx={{ border: 0, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {penalty.action_by || t("common.system")}
                            </Typography>
                          </TableCell>

                          {/* Action Buttons */}
                          <TableCell sx={{ border: 0, py: 1 }}>
                            {!penalty.is_paid && (
                              <Tooltip title={t("actions.markAsPaid")}>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleMarkAsPaid(penalty.id)}
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  <CheckCircleOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title={t("actions.markAsDeleted")}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemovePenalty(penalty.id)}
                                disabled={removePenaltyMutation.isPending}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
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
