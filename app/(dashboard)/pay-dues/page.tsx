"use client";
import {
  getAccessToken,
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
} from "@/lib/auth";
import { loadRazorpayScript } from "@/lib/loadRazorpay";
import { fetchBuildingsBySociety } from "@/services/building";
import { fetchAssignedMembers } from "@/services/flats";
import { getOccupiedHousingUnits } from "@/services/housing";
import { getDuesYearMonth } from "@/services/manage-flat-maintenance";
import { getMemberMaintenances } from "@/services/member-maintenances";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Switch,
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
  const [societyType, setSocietyType] = useState<string>("");
  const [isMultiMonthMode, setIsMultiMonthMode] = useState<boolean>(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>("");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [buildingId, setBuildingId] = useState<string>("");
  const [flatId, setFlatId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [selectedFlat, setSelectedFlat] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [multiMonthMaintenances, setMultiMonthMaintenances] = useState<any[]>(
    []
  );
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user
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

  // Set societyId and type from localStorage
  useEffect(() => {
    const id = getSocietyIdFromLocalStorage();
    const type = getSocietyTypeFromLocalStorage();
    if (id) setSocietyId(id);
    if (type) setSocietyType(type);
    fetchCurrentUser();
  }, []);

  // Fetch month options
  const { data: monthOptions = [], isLoading: isMonthLoading } = useQuery({
    queryKey: ["maintenance-months"],
    queryFn: getDuesYearMonth,
  });

  // Set default month
  useEffect(() => {
    if (!selectedMonthYear && monthOptions.length > 0 && !isMultiMonthMode) {
      const current = dayjs().startOf("month").format("YYYY-MM-DD");
      const fallback = monthOptions.includes(current)
        ? current
        : monthOptions[0];
      setSelectedMonthYear(fallback);
    }
  }, [monthOptions, selectedMonthYear, isMultiMonthMode]);

  // Fetch buildings
  const {
    data: buildings = [],
    isLoading: isBuildingLoading,
    isError: isBuildingError,
  } = useQuery({
    queryKey: ["buildings", societyId],
    queryFn: () => fetchBuildingsBySociety(societyId),
    enabled:
      !!societyId &&
      (societyType === "residential" || societyType === "commercial"),
  });

  // Fetch flats
  const {
    data: flats = [],
    isLoading: isFlatLoading,
    isError: isFlatError,
  } = useQuery({
    queryKey: ["flats", societyId, buildingId],
    queryFn: () => fetchAssignedMembers(societyId, buildingId),
    enabled:
      !!societyId &&
      !!buildingId &&
      (societyType === "residential" || societyType === "commercial"),
  });

  // Fetch housing units
  const {
    data: units = [],
    isLoading: isUnitLoading,
    isError: isUnitError,
  } = useQuery({
    queryKey: ["housing-units", societyId],
    queryFn: () => getOccupiedHousingUnits(societyId),
    enabled: !!societyId && societyType === "housing",
  });

  // Fetch maintenances for single month
  const { data: maintenances = [], isLoading: isMaintenanceLoading } = useQuery(
    {
      queryKey: ["member-maintenances", societyId, selectedMonthYear],
      queryFn: () => getMemberMaintenances(societyId, selectedMonthYear),
      enabled: !!societyId && !!selectedMonthYear && !isMultiMonthMode,
    }
  );

  // Fetch maintenances for multiple months
  const fetchMultiMonthMaintenances = async () => {
    if (!societyId || selectedMonths.length === 0) return;

    try {
      const promises = selectedMonths.map((month) =>
        getMemberMaintenances(societyId, month)
      );
      const results = await Promise.all(promises);

      // Combine all results with month information
      const combined = results.flatMap((monthData, index) =>
        monthData.map((maintenance: any) => ({
          ...maintenance,
          month: selectedMonths[index],
        }))
      );

      setMultiMonthMaintenances(combined);
    } catch (error) {
      console.error("Error fetching multi-month maintenances:", error);
      setMultiMonthMaintenances([]);
    }
  };

  // Fetch multi-month data when needed
  useEffect(() => {
    if (isMultiMonthMode && selectedMonths.length > 0 && (unitId || flatId)) {
      fetchMultiMonthMaintenances();
    }
  }, [isMultiMonthMode, selectedMonths, unitId, flatId, societyId]);

  // Reset selections when mode changes
  useEffect(() => {
    setBuildingId("");
    setFlatId("");
    setUnitId("");
    setSelectedFlat(null);
    setSelectedUnit(null);
    setSelectedMaintenance(null);
    setMultiMonthMaintenances([]);
    if (isMultiMonthMode) {
      setSelectedMonthYear("");
      setSelectedMonths([]);
    } else {
      setSelectedMonths([]);
    }
  }, [isMultiMonthMode, societyType]);

  // Handle month selection for multi-month mode
  const handleMultiMonthChange = (
    event: SelectChangeEvent<typeof selectedMonths>
  ) => {
    const value = event.target.value;
    setSelectedMonths(typeof value === "string" ? value.split(",") : value);
  };

  // Handle flat selection
  const handleFlatChange = (e: any) => {
    const id = e.target.value;
    setFlatId(id);
    const flat = flats.find((f: any) => f.id === id);
    setSelectedFlat(flat || null);
  };

  // Handle unit selection
  const handleUnitChange = (e: any) => {
    const id = e.target.value;
    setUnitId(id);
    const unit = units.find((u: any) => u.id === id);
    setSelectedUnit(unit || null);
  };

  // Match maintenance record for single month
  const matchedMaintenance = useMemo(() => {
    if (isMultiMonthMode) return null;

    if (societyType === "housing" && unitId) {
      return maintenances.find((m: any) => m.housing_id === unitId) || null;
    } else if (flatId) {
      return maintenances.find((m: any) => m.flat_id === flatId) || null;
    }
    return null;
  }, [maintenances, unitId, flatId, societyType, isMultiMonthMode]);

  // Match maintenance records for multiple months
  const matchedMultiMonthMaintenances = useMemo(() => {
    if (!isMultiMonthMode) return [];

    return multiMonthMaintenances.filter((m: any) => {
      if (societyType === "housing" && unitId) {
        return m.housing_id === unitId;
      } else if (flatId) {
        return m.flat_id === flatId;
      }
      return false;
    });
  }, [multiMonthMaintenances, unitId, flatId, societyType, isMultiMonthMode]);

  // Calculate total amount for multi-month (only unpaid ones)
  const totalAmount = useMemo(() => {
    const unpaidMaintenances = matchedMultiMonthMaintenances.filter(
      (m) => !m.maintenance_paid
    );
    return unpaidMaintenances.reduce(
      (sum: number, m: any) => sum + (parseFloat(m.maintenance_amount) || 0),
      0
    );
  }, [matchedMultiMonthMaintenances]);

  const unpaidCount = useMemo(() => {
    return matchedMultiMonthMaintenances.filter((m) => !m.maintenance_paid)
      .length;
  }, [matchedMultiMonthMaintenances]);

  // Payment readiness
  const isPaymentReady = isMultiMonthMode
    ? matchedMultiMonthMaintenances.length > 0
    : !!matchedMaintenance;

  // Open payment dialog
  const handlePayNowClick = () => {
    if (isMultiMonthMode) {
      setShowPaymentDialog(true);
    } else if (matchedMaintenance) {
      setSelectedMaintenance(matchedMaintenance);
      setShowPaymentDialog(true);
    }
  };

  // Handle payment for single month
  const handleSinglePayment = async () => {
    if (!selectedMaintenance) return;

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    const orderResponse = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: selectedMaintenance.maintenance_amount,
        currency: "INR",
        receipt: `maint-${selectedMaintenance.id?.slice(0, 20) || "unknown"}`,
      }),
    });

    const result = await orderResponse.json();
    if (!result.order) {
      alert("Failed to create order.");
      return;
    }

    const { order } = result;
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency,
      name:
        societyType === "housing"
          ? selectedUnit?.unit_number
          : selectedFlat?.flat_number,
      description: "Maintenance Payment",
      order_id: order.id,
      handler: async (response: any) => {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            maintenance_id: selectedMaintenance.id,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          alert("Payment Successful!");
          window.location.reload();
        } else {
          alert("Payment Failed. Please contact support.");
        }
      },
      prefill: {
        name: currentUser?.name || "Member",
        email: currentUser?.email || "",
        contact: currentUser?.phone || "",
      },
      theme: { color: "#3399cc" },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  // Handle payment for multiple months
  const handleMultiPayment = async () => {
    if (matchedMultiMonthMaintenances.length === 0) return;

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    // Get only unpaid maintenance IDs
    const unpaidMaintenances = matchedMultiMonthMaintenances.filter(
      (m) => !m.maintenance_paid
    );

    if (unpaidMaintenances.length === 0) {
      alert("All selected months are already paid!");
      return;
    }

    const orderResponse = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: totalAmount,
        currency: "INR",
        receipt: `multi-maint-${Date.now()}`,
        maintenance_ids: unpaidMaintenances.map((m) => m.id), // Send all maintenance IDs
      }),
    });

    const result = await orderResponse.json();
    if (!result.order) {
      alert("Failed to create order.");
      return;
    }

    const { order } = result;
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency,
      name:
        societyType === "housing"
          ? selectedUnit?.unit_number
          : selectedFlat?.flat_number,
      description: `Maintenance Payment (${unpaidMaintenances.length} months)`,
      order_id: order.id,
      handler: async (response: any) => {
        // Verify payment for all unpaid maintenance records
        const verifyResponse = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            maintenance_ids: unpaidMaintenances.map((m) => m.id), // Send all maintenance IDs
          }),
        });

        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          alert("Payment Successful for all months!");
          window.location.reload();
        } else {
          alert("Payment Failed. Please contact support.");
        }
      },
      prefill: {
        name: currentUser?.name || "Member",
        email: currentUser?.email || "",
        contact: currentUser?.phone || "",
      },
      theme: { color: "#3399cc" },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return (
    <>
      <Box p={3} maxWidth="800px" mx="auto">
        {/* Header */}
        <Typography variant="h5" fontWeight="200" mb={3}>
          Maintenance Management
        </Typography>

        {/* Multi-month toggle */}
        <Box mb={3}>
          <FormControlLabel
            control={
              <Switch
                checked={isMultiMonthMode}
                onChange={(e) => setIsMultiMonthMode(e.target.checked)}
              />
            }
            label="Pay for multiple months"
          />
        </Box>

        {/* Month Selector */}
        {!isMultiMonthMode ? (
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonthYear}
              label="Month"
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              disabled={isMonthLoading}
            >
              {monthOptions.map((m: string) => (
                <MenuItem key={m} value={m}>
                  {formatMonthYear(m)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Select Months</InputLabel>
            <Select
              multiple
              value={selectedMonths}
              onChange={handleMultiMonthChange}
              input={<OutlinedInput label="Select Months" />}
              renderValue={(selected) =>
                selected.map((month) => formatMonthYear(month)).join(", ")
              }
              disabled={isMonthLoading}
            >
              {monthOptions.map((m: string) => (
                <MenuItem key={m} value={m}>
                  <Checkbox checked={selectedMonths.indexOf(m) > -1} />
                  <ListItemText primary={formatMonthYear(m)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Dropdowns */}
        {(societyType === "residential" || societyType === "commercial") && (
          <Box
            display="flex"
            gap={2}
            mb={4}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <FormControl fullWidth>
              <InputLabel>Building</InputLabel>
              <Select
                value={buildingId}
                label="Building"
                onChange={(e) => setBuildingId(e.target.value)}
                disabled={isBuildingLoading}
              >
                {isBuildingLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  buildings.map((b: any) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name} ({b.total_floors} floors)
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!buildingId}>
              <InputLabel>Flat</InputLabel>
              <Select value={flatId} label="Flat" onChange={handleFlatChange}>
                {isFlatLoading ? (
                  <MenuItem disabled>Loading flats...</MenuItem>
                ) : flats.length === 0 ? (
                  <MenuItem disabled>No flats</MenuItem>
                ) : (
                  flats.map((f: any) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.flat_number} (Floor {f.floor_number})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        )}

        {societyType === "housing" && (
          <Box mb={4}>
            <FormControl fullWidth>
              <InputLabel>Unit Number</InputLabel>
              <Select
                value={unitId}
                label="Unit Number"
                onChange={handleUnitChange}
              >
                {isUnitLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  units.map((u: any) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.unit_number}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* No maintenance record alert */}
        {!isMaintenanceLoading &&
          !isPaymentReady &&
          (unitId || flatId) &&
          ((!isMultiMonthMode && !matchedMaintenance) ||
            (isMultiMonthMode &&
              matchedMultiMonthMaintenances.length === 0)) && (
            <Alert severity="info" sx={{ mb: 3 }}>
              No maintenance record found for this{" "}
              {societyType === "housing" ? "unit" : "flat"}.
            </Alert>
          )}

        {/* Single Month Display */}
        {!isMultiMonthMode && isPaymentReady && matchedMaintenance && (
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Maintenance Details
              </Typography>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                gap={2}
                mb={2}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Month/Year
                  </Typography>
                  <Typography variant="body1">
                    {formatMonthYear(selectedMonthYear)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₹{matchedMaintenance.maintenance_amount}
                  </Typography>
                </Box>

                {societyType === "housing" && selectedUnit && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Unit Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedUnit.unit_number}
                    </Typography>
                  </Box>
                )}

                {(societyType === "residential" ||
                  societyType === "commercial") &&
                  selectedFlat && (
                    <>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Building
                        </Typography>
                        <Typography variant="body1">
                          {selectedFlat.building_name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Flat Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedFlat.flat_number}
                        </Typography>
                      </Box>
                    </>
                  )}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={
                    matchedMaintenance.maintenance_paid ? "Paid" : "Pending"
                  }
                  color={
                    matchedMaintenance.maintenance_paid ? "success" : "error"
                  }
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Multi-Month Display */}
        {isMultiMonthMode &&
          isPaymentReady &&
          matchedMultiMonthMaintenances.length > 0 && (
            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Multi-Month Maintenance Details
                </Typography>

                <Box mb={3}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Total Amount (Unpaid)
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ₹{totalAmount.toFixed(2)}
                  </Typography>
                  {unpaidCount < matchedMultiMonthMaintenances.length && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {unpaidCount} of {matchedMultiMonthMaintenances.length}{" "}
                      months pending
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body1" gutterBottom fontWeight="medium">
                  Monthly Breakdown:
                </Typography>

                {matchedMultiMonthMaintenances.map((maintenance, index) => (
                  <Box key={index} mb={2}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body1">
                        {formatMonthYear(maintenance.month)}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight="medium">
                          ₹
                          {parseFloat(maintenance.maintenance_amount).toFixed(
                            2
                          )}
                        </Typography>
                        <Chip
                          label={
                            maintenance.maintenance_paid ? "Paid" : "Pending"
                          }
                          color={
                            maintenance.maintenance_paid ? "success" : "error"
                          }
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}

                {societyType === "housing" && selectedUnit && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Unit Number: {selectedUnit.unit_number}
                    </Typography>
                  </Box>
                )}

                {(societyType === "residential" ||
                  societyType === "commercial") &&
                  selectedFlat && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        Building: {selectedFlat.building_name} | Flat:{" "}
                        {selectedFlat.flat_number}
                      </Typography>
                    </Box>
                  )}
              </CardContent>
            </Card>
          )}

        {/* Pay Button */}
        {isPaymentReady && (
          <Button
            variant="contained"
            color={
              isMultiMonthMode
                ? unpaidCount > 0
                  ? "error"
                  : "success"
                : matchedMaintenance?.maintenance_paid
                ? "primary"
                : "error"
            }
            onClick={handlePayNowClick}
            fullWidth
            size="large"
            disabled={isMultiMonthMode && unpaidCount === 0}
          >
            {isMultiMonthMode
              ? unpaidCount > 0
                ? `Pay ${unpaidCount} Month${
                    unpaidCount > 1 ? "s" : ""
                  } (₹${totalAmount.toFixed(2)})`
                : "All Months Paid"
              : matchedMaintenance?.maintenance_paid
              ? "View Payment"
              : "Pay Maintenance"}
          </Button>
        )}

        {/* Payment Dialog */}
        <Dialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {isMultiMonthMode
              ? "Confirm Multi-Month Payment"
              : selectedMaintenance?.maintenance_paid
              ? "Payment Details"
              : "Confirm Payment"}
          </DialogTitle>
          <DialogContent>
            {isMultiMonthMode ? (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  Total Amount: ₹{totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Unpaid Months: {unpaidCount}
                </Typography>
                <Divider sx={{ my: 2 }} />
                {matchedMultiMonthMaintenances
                  .filter((m) => !m.maintenance_paid)
                  .map((maintenance, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="body2">
                        {formatMonthYear(maintenance.month)}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ₹{parseFloat(maintenance.maintenance_amount).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            ) : (
              selectedMaintenance && (
                <Box mt={2}>
                  <Typography variant="body1">
                    <strong>Amount:</strong> ₹
                    {selectedMaintenance.maintenance_amount}
                  </Typography>
                  <Typography variant="body1" mt={1}>
                    <strong>Status:</strong>{" "}
                    <Chip
                      label={
                        selectedMaintenance.maintenance_paid
                          ? "Paid"
                          : "Pending"
                      }
                      color={
                        selectedMaintenance.maintenance_paid
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </Typography>
                  {selectedMaintenance.maintenance_paid_at && (
                    <Typography variant="body1" mt={1}>
                      <strong>Paid On:</strong>{" "}
                      {dayjs(selectedMaintenance.maintenance_paid_at).format(
                        "DD MMM YYYY, hh:mm A"
                      )}
                    </Typography>
                  )}
                </Box>
              )
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPaymentDialog(false)}>Close</Button>
            {isMultiMonthMode
              ? unpaidCount > 0 && (
                  <Button
                    onClick={handleMultiPayment}
                    variant="contained"
                    color="primary"
                    sx={{ bgcolor: "#C62828" }}
                  >
                    Pay ₹{totalAmount.toFixed(2)}
                  </Button>
                )
              : !selectedMaintenance?.maintenance_paid && (
                  <Button
                    onClick={handleSinglePayment}
                    variant="contained"
                    color="primary"
                    sx={{ bgcolor: "#C62828" }}
                  >
                    Pay Now
                  </Button>
                )}
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
