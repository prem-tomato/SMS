"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import {
  getAccessToken,
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
} from "@/lib/auth";
import { getDuesYearMonth } from "@/services/manage-flat-maintenance";
import { getMemberMaintenances } from "@/services/member-maintenances";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

const formatMonthYear = (value: string) => {
  const date = new Date(value);
  return `${date.toLocaleString("default", {
    month: "long",
  })} ${date.getFullYear()}`;
};

export default function MemberMaintenancePage() {
  const [societyId, setSocietyId] = useState<string>("");
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>("");
  const [societyType, setSocietyType] = useState<string>("");
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
          "Authorization": `Bearer ${getAccessToken()}`,
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

  const handlePayNowClick = () => {
    if (userMaintenanceRecord) {
      setSelectedMaintenance(userMaintenanceRecord);
      setShowPaymentDialog(true);
    }
  };

  const handleViewClick = () => {
    if (userMaintenanceRecord) {
      setSelectedMaintenance(userMaintenanceRecord);
      setShowPaymentDialog(true);
    }
  };

  const handlePayment = () => {
    // Handle actual payment logic here
    console.log("Processing payment for:", selectedMaintenance);
    // You can call your payment API here
    setShowPaymentDialog(false);
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
      {/* Unpaid Maintenance Alert - Show if user has unpaid maintenance */}
      {userMaintenanceRecord && !userMaintenanceRecord.maintenance_paid && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button
              color="warning"
              size="small"
              variant="contained"
              onClick={handlePayNowClick}
            >
              Pay Now
            </Button>
          }
        >
          You have unpaid maintenance of ₹
          {userMaintenanceRecord.maintenance_amount} for{" "}
          {formatMonthYear(selectedMonthYear)}
        </Alert>
      )}

      {/* Header with Month Filter and Action Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {/* User Action Button - Only show if user has maintenance record */}
        {userMaintenanceRecord && (
          <Box>
            {userMaintenanceRecord.maintenance_paid ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleViewClick}
              >
                View My Payment
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handlePayNowClick}
              >
                Pay My Maintenance
              </Button>
            )}
          </Box>
        )}

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
        height={
          userMaintenanceRecord && !userMaintenanceRecord.maintenance_paid
            ? "calc(100vh - 280px)"
            : "calc(100vh - 220px)"
        }
        pageSize={20}
      />

      {/* Payment/View Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedMaintenance?.maintenance_paid
            ? "Payment Details"
            : "Pay Maintenance"}
        </DialogTitle>
        <DialogContent>
          {selectedMaintenance && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedMaintenance.maintenance_paid
                    ? "Payment Completed"
                    : "Maintenance Due"}
                </Typography>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Month/Year
                  </Typography>
                  <Typography variant="body1">
                    {formatMonthYear(selectedMonthYear)}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5" color="primary">
                    ₹{selectedMaintenance.maintenance_amount}
                  </Typography>
                </Box>

                {selectedMaintenance.maintenance_paid &&
                  selectedMaintenance.maintenance_paid_at && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Paid On
                      </Typography>
                      <Typography variant="body1" color="success.main">
                        {dayjs(selectedMaintenance.maintenance_paid_at).format(
                          "DD MMM YYYY, hh:mm A"
                        )}
                      </Typography>
                    </Box>
                  )}

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={
                      selectedMaintenance.maintenance_paid ? "Paid" : "Pending"
                    }
                    size="small"
                    color={
                      selectedMaintenance.maintenance_paid ? "success" : "error"
                    }
                  />
                </Box>

                {societyType === "housing" &&
                  selectedMaintenance.housing_unit_number && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Unit Number
                      </Typography>
                      <Typography variant="body1">
                        {selectedMaintenance.housing_unit_number}
                      </Typography>
                    </Box>
                  )}

                {(societyType === "residential" ||
                  societyType === "commercial") && (
                  <>
                    {selectedMaintenance.building_name && (
                      <Box mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Building
                        </Typography>
                        <Typography variant="body1">
                          {selectedMaintenance.building_name}
                        </Typography>
                      </Box>
                    )}
                    {selectedMaintenance.flat_number && (
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Flat Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedMaintenance.flat_number}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Society
                  </Typography>
                  <Typography variant="body1">
                    {selectedMaintenance.society_name}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>
            {selectedMaintenance?.maintenance_paid ? "Close" : "Cancel"}
          </Button>
          {!selectedMaintenance?.maintenance_paid && (
            <Button
              onClick={handlePayment}
              variant="contained"
              color="primary"
              size="large"
            >
              Pay Now
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
