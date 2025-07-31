"use client";

import {
  getParticularFlat,
  markFlatPenaltyDeleted,
  markFlatPenaltyPaid,
} from "@/services/flats";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { Close as CloseIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface ViewFlatModalProps {
  open: boolean;
  onClose: () => void;
  selectedFlat: {
    societyId: string;
    buildingId: string;
    flatId: string;
  } | null;
  societyType: string | null;
}

export const ViewFlatModal = ({
  open,
  onClose,
  selectedFlat,
  societyType,
}: ViewFlatModalProps) => {
  const enabled = open && !!selectedFlat;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["particular-flat", selectedFlat?.flatId],
    queryFn: () =>
      getParticularFlat(
        selectedFlat!.societyId,
        selectedFlat!.buildingId,
        selectedFlat!.flatId
      ),
    enabled,
  });

  // Preserve the flat data even when modal is closing
  const [preservedFlat, setPreservedFlat] = useState(null);

  useEffect(() => {
    // Preserve the flat data
    if (data?.data) {
      setPreservedFlat(data.data);
    }
  }, [data?.data]);

  // Use preserved data if available, otherwise use current data
  const flat = preservedFlat || data?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          exit: 150, // Faster exit, smooth enter
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
            {societyType === "residential" ? "Resident Detail" : "Shop Detail"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {isLoading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={8}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        {flat && (
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
                        {societyType === "residential" ? "Flat Number" : "Shop Number"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2" fontWeight="600">
                        {flat.flat_number}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        Floor
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2">
                        {flat.floor_number}
                      </Typography>
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
                        label={flat.is_occupied ? "Occupied" : "Vacant"}
                        color={flat.is_occupied ? "success" : "default"}
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
                        {flat.square_foot ? `${flat.square_foot} sq ft` : "N/A"}
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
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        Building
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2">
                        {flat.building_name}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        Society
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 1 }}>
                      <Typography variant="body2">
                        {flat.society_name}
                      </Typography>
                    </TableCell>
                  </TableRow>
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
                        {formatCurrency(flat.current_maintenance)}
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
              {!flat.penalties || flat.penalties.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No penalties
                </Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {flat.penalties.map((penalty: any) => (
                      <TableRow key={penalty.id}>
                        {/* Amount */}
                        <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            color="error.main"
                          >
                            {formatCurrency(penalty.amount)}
                          </Typography>
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
                        </TableCell>

                        {/* Action By */}
                        <TableCell sx={{ border: 0, py: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {penalty.action_by}
                          </Typography>
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell sx={{ border: 0, py: 1 }}>
                          <Tooltip title="Mark as Paid">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={async () => {
                                try {
                                  await markFlatPenaltyPaid(
                                    flat.society_id,
                                    flat.building_id,
                                    flat.id,
                                    penalty.id
                                  );
                                  await refetch();
                                } catch (error: any) {
                                  alert(
                                    error.message ||
                                      "Failed to mark penalty as paid"
                                  );
                                }
                              }}
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Mark as Deleted">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => {
                                try {
                                  await markFlatPenaltyDeleted(
                                    flat.society_id,
                                    flat.building_id,
                                    flat.id,
                                    penalty.id
                                  );
                                  await refetch();
                                } catch (error: any) {
                                  alert(
                                    error.message ||
                                      "Failed to mark penalty as deleted"
                                  );
                                }
                              }}
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
};
