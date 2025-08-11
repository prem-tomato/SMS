"use client";

import {
  getParticularFlat,
  markFlatPenaltyDeleted,
  markFlatPenaltyPaid,
} from "@/services/flats";
import { Close as CloseIcon } from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("ViewFlatModal");

  const enabled = open && !!selectedFlat;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["particular-flat", selectedFlat?.flatId],
    queryFn: () =>
      getParticularFlat(
        selectedFlat!.societyId,
        selectedFlat!.buildingId,
        selectedFlat!.flatId
      ),
    enabled,
  });

  const [preservedFlat, setPreservedFlat] = useState(null);

  useEffect(() => {
    if (data?.data) {
      setPreservedFlat(data.data);
    }
  }, [data?.data]);

  const flat = preservedFlat || data?.data;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="600" color="text.primary">
            {societyType === "commercial" ? t("shopDetail") : t("flatDetail")}
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
                {t("basicInfo")}
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: 0, py: 1, pl: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {societyType === "commercial"
                          ? t("shopNumber")
                          : t("flatNumber")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {flat.flat_number}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t("floor")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {flat.floor_number}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t("status")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flat.is_occupied ? t("occupied") : t("vacant")}
                        color={flat.is_occupied ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t("area")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {flat.square_foot
                          ? `${flat.square_foot} ${t("sqFt")}`
                          : t("na")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            {/* Property Details */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                {t("propertyInfo")}
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t("building")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {flat.building_name}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t("society")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {flat.society_name}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t("currentMaintenance")}
                      </Typography>
                    </TableCell>
                    <TableCell>
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
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                {t("penalties")}
              </Typography>
              {!flat.penalties || flat.penalties.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("noPenalties")}
                </Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {flat.penalties.map((penalty: any) => (
                      <TableRow key={penalty.id}>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            color="error.main"
                          >
                            {formatCurrency(penalty.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {penalty.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(penalty.created_at).format("DD-MM-YYYY")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {penalty.action_by}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={t("markAsPaid")}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={async () => {
                                await markFlatPenaltyPaid(
                                  flat.society_id,
                                  flat.building_id,
                                  flat.id,
                                  penalty.id
                                );
                                await refetch();
                              }}
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("markAsDeleted")}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => {
                                await markFlatPenaltyDeleted(
                                  flat.society_id,
                                  flat.building_id,
                                  flat.id,
                                  penalty.id
                                );
                                await refetch();
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
          {t("close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
