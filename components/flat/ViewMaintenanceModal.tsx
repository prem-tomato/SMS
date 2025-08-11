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
import { useTranslations } from "next-intl"; // ✅ Added

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
  const t = useTranslations("maintenance"); // ✅ Namespace

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
      <DialogTitle>{t("history")}</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : isError ? (
          <Typography color="error">{t("failedLoad")}</Typography>
        ) : data?.data?.length === 0 ? (
          <Typography>{t("noRecords")}</Typography>
        ) : (
          <Stack spacing={2}>
            {Array.isArray(data?.data) &&
              data.data.map((item: any) => (
                <Box key={item.maintenance_id}>
                  {item.amount_type && (
                    <Typography variant="subtitle1" fontWeight="bold">
                      {t("type")}: {item.amount_type.toUpperCase()}
                    </Typography>
                  )}
                  <Typography>
                    {t("amount")}: ₹
                    {Number(item.maintenance_amount).toLocaleString("en-IN")}
                  </Typography>
                  <Typography>
                    {t("reason")}: {item.reason}
                  </Typography>
                  <Typography>
                    {t("created")}:{" "}
                    {dayjs(item.created_at).format("DD MMM YYYY")}
                  </Typography>

                  {item.settlements.length > 0 && (
                    <>
                      <Typography fontWeight="bold" mt={1}>
                        {t("settlements")}:
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
                                ₹{s.settlement_amount} {t("on")}{" "}
                                {dayjs(s.created_at).format("DD MMM YYYY")}
                              </Typography>

                              {s.is_paid && s.paid_at && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {t("paid")}:{" "}
                                  {dayjs(s.paid_at).format(
                                    "DD MMM YYYY, hh:mm A"
                                  )}
                                </Typography>
                              )}
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={
                                  s.is_paid
                                    ? t("paidStatus")
                                    : t("unpaidStatus")
                                }
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
                                    ? t("marking")
                                    : t("markAsPaid")}
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
                        {t("monthlyDeductions")}:
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
                                  {t("month")} {m.month}: ₹{m.amount}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {t("created")}:{" "}
                                  {dayjs(m.created_at).format("DD MMM YYYY")}
                                </Typography>
                                {m.paid && m.paid_at && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    {t("paid")}:{" "}
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
                                  label={
                                    m.paid ? t("paidStatus") : t("unpaidStatus")
                                  }
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
                                      ? t("marking")
                                      : t("markAsPaid")}
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
}
