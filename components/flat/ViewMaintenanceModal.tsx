"use client";

import {
  getFlatMaintenanceDetails,
  markMonthlyMaintenanceAsPaid,
  markSettlementAsPaid,
} from "@/services/manage-flat-maintenance";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

export function ViewMaintenanceModal({
  open,
  onClose,
  selectedFlat,
}: {
  open: boolean;
  onClose: () => void;
  selectedFlat: {
    societyId: string;
    buildingId: string;
    flatId: string;
  } | null;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["flat-maintenance", selectedFlat],
    queryFn: () =>
      getFlatMaintenanceDetails(
        selectedFlat!.societyId,
        selectedFlat!.buildingId,
        selectedFlat!.flatId
      ),
    enabled: open && !!selectedFlat,
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({
      monthlyMaintenanceId,
      flatMaintenanceId,
    }: {
      monthlyMaintenanceId: string;
      flatMaintenanceId: string;
    }) => markMonthlyMaintenanceAsPaid(monthlyMaintenanceId, flatMaintenanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["flat-maintenance", selectedFlat],
      });
    },
  });

  const markSettlementAsPaidMutation = useMutation({
    mutationFn: ({
      settlementId,
      flatMaintenanceId,
    }: {
      settlementId: string;
      flatMaintenanceId: string;
    }) => markSettlementAsPaid(settlementId, flatMaintenanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["flat-maintenance", selectedFlat],
      });
    },
  });

  const handleMarkAsPaid = (
    monthlyMaintenanceId: string,
    flatMaintenanceId: string
  ) => {
    markAsPaidMutation.mutate({ monthlyMaintenanceId, flatMaintenanceId });
  };

  const handleMarkSettlementAsPaid = (
    settlementId: string,
    flatMaintenanceId: string
  ) => {
    markSettlementAsPaidMutation.mutate({ settlementId, flatMaintenanceId });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Maintenance History</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : isError ? (
          <Typography color="error">
            Failed to load maintenance details
          </Typography>
        ) : data?.data?.length === 0 ? (
          <Typography>No maintenance records found.</Typography>
        ) : (
          <Stack spacing={2}>
            {Array.isArray(data?.data) &&
              data.data.map((item: any) => (
                <Box key={item.maintenance_id}>
                  {item.amount_type && (
                    <Typography variant="subtitle1" fontWeight="bold">
                      Type: {item.amount_type.toUpperCase()}
                    </Typography>
                  )}
                  <Typography>
                    Amount: ₹
                    {Number(item.maintenance_amount).toLocaleString("en-IN")}
                  </Typography>
                  <Typography>Reason: {item.reason}</Typography>
                  <Typography>
                    Created: {dayjs(item.created_at).format("DD MMM YYYY")}
                  </Typography>

                  {item.settlements.length > 0 && (
                    <>
                      <Typography fontWeight="bold" mt={1}>
                        Settlements:
                      </Typography>
                      <Stack spacing={1} mt={1}>
                        {item.settlements.map((s: any) => (
                          <Box
                            key={s.id}
                            sx={{
                              p: 2,
                              border: "1px solid #e0e0e0",
                              borderRadius: 2,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
                            {/* Left section: Info */}
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                ₹{s.settlement_amount} on{" "}
                                {dayjs(s.created_at).format("DD MMM YYYY")}
                              </Typography>

                              {s.is_paid && s.paid_at && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Paid:{" "}
                                  {dayjs(s.paid_at).format(
                                    "DD MMM YYYY, hh:mm A"
                                  )}
                                </Typography>
                              )}
                            </Box>

                            {/* Right section: Status + Action */}
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={s.is_paid ? "Paid" : "Unpaid"}
                                color={s.is_paid ? "success" : "warning"}
                                size="small"
                              />
                              {!s.is_paid && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() =>
                                    handleMarkSettlementAsPaid(
                                      s.id,
                                      item.maintenance_id
                                    )
                                  }
                                  disabled={
                                    markSettlementAsPaidMutation.isPending
                                  }
                                >
                                  {markSettlementAsPaidMutation.isPending
                                    ? "Marking..."
                                    : "Mark as Paid"}
                                </Button>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  )}

                  {item.monthly_maintenance.length > 0 && (
                    <>
                      <Typography fontWeight="bold" mt={1}>
                        Monthly Deductions:
                      </Typography>
                      <Stack spacing={1} mt={1}>
                        {item.monthly_maintenance
                          .sort((a: any, b: any) => a.month - b.month)
                          .map((m: any) => (
                            <Box
                              key={m.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 1,
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                              }}
                            >
                              <Box>
                                <Typography variant="body2">
                                  Month {m.month}: ₹{m.amount}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Created:{" "}
                                  {dayjs(m.created_at).format("DD MMM YYYY")}
                                </Typography>
                                {m.paid && m.paid_at && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Paid:{" "}
                                    {dayjs(m.paid_at).format(
                                      "DD MMM YYYY, hh:mm A"
                                    )}
                                  </Typography>
                                )}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={m.paid ? "Paid" : "Unpaid"}
                                  color={m.paid ? "success" : "warning"}
                                  size="small"
                                />
                                {!m.paid && (
                                  <Button 
                                    size="small"
                                    variant="outlined"
                                    onClick={() =>
                                      handleMarkAsPaid(
                                        m.id,
                                        item.maintenance_id
                                      )
                                    }
                                    disabled={markAsPaidMutation.isPending}
                                  >
                                    {markAsPaidMutation.isPending
                                      ? "Marking..."
                                      : "Mark as Paid"}
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          ))}
                      </Stack>
                    </>
                  )}
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
