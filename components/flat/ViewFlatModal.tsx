"use client";

import { getParticularFlat } from "@/services/flats";
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
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface ViewFlatModalProps {
  open: boolean;
  onClose: () => void;
  selectedFlat: {
    societyId: string;
    buildingId: string;
    flatId: string;
  } | null;
}

export const ViewFlatModal = ({
  open,
  onClose,
  selectedFlat,
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

  useEffect(() => {
    if (enabled) refetch();
  }, [enabled, refetch]);

  const flat = data?.data;

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
            Flat Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={8}
          >
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Box textAlign="center" py={4}>
            <Typography color="error">Failed to load flat details</Typography>
          </Box>
        ) : flat ? (
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
                        Flat Number
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

            {/* Pending Maintenance */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Pending Maintenance
              </Typography>
              {!flat.pending_maintenance ||
              flat.pending_maintenance.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No pending maintenance
                </Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {flat.pending_maintenance?.map(
                      (item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                            <Typography variant="body2" fontWeight="600">
                              {formatCurrency(item.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ border: 0, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {item.reason}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              )}
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
                    {flat.penalties?.map((penalty: any) => (
                      <TableRow key={penalty.id}>
                        <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            color="error.main"
                          >
                            {formatCurrency(penalty.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: 0, py: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {penalty.reason}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>

            {/* Actions */}
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="600">
                Action By
                <Chip
                  label={flat.action_by}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600, ml: 1 }}
                >
                  {flat.action_by}
                </Chip>
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">No data found</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" size="medium">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
