"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import {
  getAccessToken,
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
} from "@/lib/auth";
import { getDuesYearMonth } from "@/services/manage-flat-maintenance";
import { getMemberMaintenances } from "@/services/member-maintenances";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

interface MaintenanceRecord {
  id: string;
  maintenance_amount: number;
  maintenance_paid: boolean;
  maintenance_paid_at?: string;
  member_names: string[];
  building_name: string;
  flat_number: string;
  housing_unit_number?: string;
  user_ids: string[];
  // Razorpay fields
  razorpay_payment_id?: string;
  razorpay_payment_id_full?: string;
  razorpay_order_id?: string;
  bank_rrn?: string;
  invoice_id?: string;
  payment_method?: string;
  payer_upi_id?: string;
  payer_account_type?: string;
  customer_contact?: string;
  customer_email?: string;
  total_fee?: number;
  razorpay_fee?: number;
  gst?: number;
  payment_description?: string;
  payment_created_at?: string;
}

const formatMonthYear = (value: string) => {
  const date = new Date(value);
  return `${date.toLocaleString("default", {
    month: "long",
  })} ${date.getFullYear()}`;
};

// Payment Details Dialog Component
const PaymentDetailsDialog = ({
  open,
  onClose,
  record,
}: {
  open: boolean;
  onClose: () => void;
  record: MaintenanceRecord | null;
}) => {
  if (!record) return null;

  const isPaid = record.maintenance_paid;
  const hasPaymentDetails = record.razorpay_payment_id_full;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "400px" },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isPaid ? "Payment Details" : "Maintenance Details"}
          </Typography>
          <Chip
            label={isPaid ? "Paid" : "Pending"}
            color={isPaid ? "success" : "error"}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Basic Maintenance Info */}
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Maintenance Information
        </Typography>

        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ₹{record.maintenance_amount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Unit/Flat
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {record.housing_unit_number ||
                    `${record.building_name} - ${record.flat_number}`}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Members
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {record.member_names?.map((name: string, index: number) => (
                  <Chip
                    key={index}
                    label={name}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                )) || "-"}
              </Box>
            </Box>
          </Stack>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* Payment Status Section */}
        {isPaid && hasPaymentDetails ? (
          <>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Razorpay Payment Details
            </Typography>

            <Paper elevation={1} sx={{ p: 2 }}>
              <Stack spacing={2}>
                {/* Basic Payment Info */}
                <Stack direction="row" spacing={4}>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Payment ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {record.razorpay_payment_id_full || "N/A"}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Order ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {record.razorpay_order_id || "N/A"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={4}>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {record.payment_method || "N/A"}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {record.payment_created_at
                        ? dayjs(record.payment_created_at).format(
                            "DD MMM YYYY, hh:mm A"
                          )
                        : record.maintenance_paid_at
                        ? dayjs(record.maintenance_paid_at).format(
                            "DD MMM YYYY, hh:mm A"
                          )
                        : "N/A"}
                    </Typography>
                  </Box>
                </Stack>

                {/* Additional Payment Details */}
                {(record.bank_rrn || record.payer_upi_id) && (
                  <Stack direction="row" spacing={4}>
                    {record.bank_rrn && (
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary">
                          Bank RRN
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {record.bank_rrn}
                        </Typography>
                      </Box>
                    )}
                    {record.payer_upi_id && (
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary">
                          UPI ID
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {record.payer_upi_id}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}

                {/* Customer Details */}
                {(record.customer_contact || record.customer_email) && (
                  <Stack direction="row" spacing={4}>
                    {record.customer_contact && (
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary">
                          Contact
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {record.customer_contact}
                        </Typography>
                      </Box>
                    )}
                    {record.customer_email && (
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {record.customer_email}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}

                {/* Fee Details */}
                {(record.total_fee || record.razorpay_fee || record.gst) && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Fee Breakdown
                    </Typography>
                    <Stack direction="row" spacing={4}>
                      {record.total_fee && (
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">
                            Total Fee
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            ₹{record.total_fee}
                          </Typography>
                        </Box>
                      )}
                      {record.razorpay_fee && (
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">
                            Razorpay Fee
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            ₹{record.razorpay_fee}
                          </Typography>
                        </Box>
                      )}
                      {record.gst && (
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">
                            GST
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            ₹{record.gst}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </>
                )}
              </Stack>
            </Paper>
          </>
        ) : isPaid ? (
          <>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Payment Status
            </Typography>
            <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
              <Chip label="Payment Completed" color="success" sx={{ mb: 2 }} />
              <Typography variant="body1">
                Paid on:{" "}
                {record.maintenance_paid_at
                  ? dayjs(record.maintenance_paid_at).format(
                      "DD MMM YYYY, hh:mm A"
                    )
                  : "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Payment gateway details not available
              </Typography>
            </Paper>
          </>
        ) : (
          <>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Payment Status
            </Typography>
            <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
              <Chip label="Payment Pending" color="error" sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Maintenance payment is still pending
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Amount: ₹{record.maintenance_amount}
              </Typography>
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function DuesSummary() {
  const [societyId, setSocietyId] = useState<string>("");
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>("");
  const [societyType, setSocietyType] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Set societyId from localStorage and fetch current user
  useEffect(() => {
    const id = getSocietyIdFromLocalStorage();
    const type = getSocietyTypeFromLocalStorage();
    if (type) setSocietyType(type);
    if (id) setSocietyId(id);

    // Fetch current user
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch month options
  const { data: monthOptions = [] } = useQuery({
    queryKey: ["maintenance-months"],
    queryFn: getDuesYearMonth,
  });

  // Set default month to current month if not yet selected
  useEffect(() => {
    if (!selectedMonthYear && monthOptions.length > 0) {
      const current = dayjs().startOf("month").format("YYYY-MM-DD");
      const fallback = monthOptions.includes(current)
        ? current
        : monthOptions[0];
      setSelectedMonthYear(fallback);
    }
  }, [monthOptions, selectedMonthYear]);

  // Fetch member maintenance data
  const { data: maintenances = [], isLoading } = useQuery({
    queryKey: ["member-maintenances", societyId, selectedMonthYear],
    queryFn: () => getMemberMaintenances(societyId, selectedMonthYear),
    enabled: !!societyId && !!selectedMonthYear,
  });

  // Find user's maintenance record for current month
  const userMaintenanceRecord = useMemo(() => {
    if (!currentUser?.id || !maintenances.length) return null;

    // Find maintenance record where current user's ID is in user_ids array
    const userRecord = maintenances.find((maintenance: any) => {
      return (
        maintenance.user_ids &&
        Array.isArray(maintenance.user_ids) &&
        maintenance.user_ids.includes(currentUser.id)
      );
    });

    return userRecord;
  }, [maintenances, currentUser]);

  const handleViewDetails = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRecord(null);
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: "maintenance_amount",
        headerName: "Amount",
        flex: 1,
        renderCell: (params: any) => `₹${params?.value || "0"}`,
      },
      {
        field: "maintenance_paid",
        headerName: "Status",
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params?.value ? "Paid" : "Pending"}
            size="small"
            color={params?.value ? "success" : "error"}
            sx={{ fontSize: "0.75rem" }}
          />
        ),
      },
      {
        field: "maintenance_paid_at",
        headerName: "Paid At",
        flex: 1.5,
        renderCell: (params: any) =>
          params?.value
            ? dayjs(params.value).format("DD MMM YYYY, hh:mm A")
            : "-",
      },
      {
        field: "member_names",
        headerName: "Members",
        flex: 2,
        renderCell: (params: any) => (
          <Box>
            {params?.value?.map((name: string, index: number) => (
              <Chip
                key={index}
                label={name}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5, fontSize: "0.7rem" }}
              />
            )) || "-"}
          </Box>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.8,
        sortable: false,
        renderCell: (params: any) => (
          <IconButton
            size="small"
            onClick={() => handleViewDetails(params.row)}
            color="primary"
            sx={{
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        ),
      },
    ];

    // Add society-type specific columns at the beginning
    if (societyType === "housing") {
      return [
        {
          field: "housing_unit_number",
          headerName: "Unit Number",
          flex: 1,
        },
        ...baseColumns,
      ];
    } else if (societyType === "residential" || societyType === "commercial") {
      return [
        {
          field: "building_name",
          headerName: "Building",
          flex: 1,
        },
        {
          field: "flat_number",
          headerName: "Flat Number",
          flex: 1,
        },
        ...baseColumns,
      ];
    }

    // Fallback - show all available fields
    return [
      {
        field: "building_name",
        headerName: "Building",
        flex: 1,
      },
      {
        field: "flat_number",
        headerName: "Flat Number",
        flex: 1,
      },
      {
        field: "housing_unit_number",
        headerName: "Unit Number",
        flex: 1,
      },
      ...baseColumns,
    ];
  }, [societyType]);

  return (
    <Box height="calc(100vh - 180px)">
      {/* Header with Month Filter and Action Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {/* Month-Year Filter */}
        <FormControl size="small">
          <InputLabel>Month</InputLabel>
          <Select
            value={selectedMonthYear}
            label="Month"
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {monthOptions.map((m: string) => (
              <MenuItem key={m} value={m}>
                {formatMonthYear(m)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Data Grid */}
      <CommonDataGrid
        rows={maintenances}
        columns={columns}
        loading={isLoading}
        height="calc(100vh - 180px)"
        pageSize={20}
      />

      {/* Payment Details Dialog */}
      <PaymentDetailsDialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        record={selectedRecord}
      />
    </Box>
  );
}
