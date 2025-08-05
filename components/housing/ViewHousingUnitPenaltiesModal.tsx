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

  useEffect(() => {
    // Preserve the penalties data
    if (penalties && penalties.length >= 0) {
      setPreservedPenalties(penalties);
    }
    // Preserve unit data
    if (selectedUnit?.unitData) {
      setPreservedUnit(selectedUnit.unitData);
    }
  }, [penalties, selectedUnit?.unitData]);

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
      alert(error.message || "Failed to mark penalty as paid");
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
      alert(error.message || "Failed to remove penalty");
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
            Housing Unit Detail
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
                Basic Information
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        Unit Number
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
                        Unit Type
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2">{unit.unit_type}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Chip
                        label={unit.is_occupied ? "Occupied" : "Vacant"}
                        color={unit.is_occupied ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        Area
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2">
                        {unit.square_foot ? `${unit.square_foot} sq ft` : "N/A"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            {/* Property Details */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Property Information
              </Typography>
              <Table size="small">
                <TableBody>
                  {unit.building_name && (
                    <TableRow>
                      <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                          Building
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
                          Society
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
                        Current Maintenance
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
                Penalties
              </Typography>
              {!displayPenalties || displayPenalties.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No penalties
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
                                PAID
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
                                Paid:{" "}
                                {dayjs(penalty.paid_at).format("DD-MM-YYYY")}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Action By */}
                          <TableCell sx={{ border: 0, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {penalty.action_by || "System"}
                            </Typography>
                          </TableCell>

                          {/* Action Buttons */}
                          <TableCell sx={{ border: 0, py: 1 }}>
                            {!penalty.is_paid && (
                              <Tooltip title="Mark as Paid">
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

                            <Tooltip title="Mark as Deleted">
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
