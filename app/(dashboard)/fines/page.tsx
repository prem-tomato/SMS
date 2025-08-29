"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import { useRazorpay } from "@/hooks/useRazorpay";
import { getSocietyIdFromLocalStorage } from "@/lib/auth";
import { fetchFinesBySocietyId } from "@/services/fines";
import { Alert, Box, Button, Chip, Snackbar, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function Fines() {
  const [societyId, setSocietyId] = useState<string>("");
  const [paymentAlert, setPaymentAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const queryClient = useQueryClient();
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();

  useEffect(() => {
    setSocietyId(getSocietyIdFromLocalStorage()!);
  }, []);

  const { data: fines = [], isLoading: loadingFines } = useQuery({
    queryKey: ["fines", societyId],
    queryFn: async () => {
      return fetchFinesBySocietyId(societyId);
    },
    enabled: !!societyId,
  });

  const handlePayment = async (fine: any) => {
    await initiatePayment({
      fineId: fine.id,
      amount: fine.amount,
      buildingName: fine.building_name,
      flatNumber: fine.flat_number,
      reason: fine.reason,
      onSuccess: () => {
        setPaymentAlert({
          open: true,
          message: "Payment completed successfully!",
          severity: "success",
        });
        // Refresh the fines data
        queryClient.invalidateQueries({ queryKey: ["fines", societyId] });
      },
      onFailure: (error) => {
        setPaymentAlert({
          open: true,
          message: "Payment failed. Please try again.",
          severity: "error",
        });
        console.error("Payment failed:", error);
      },
    });
  };

  const handleCloseAlert = () => {
    setPaymentAlert((prev) => ({ ...prev, open: false }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not Paid";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      field: "building_name",
      headerName: "Building",
      width: 180,
      flex: 1,
      minWidth: 120,
    },
    {
      field: "flat_number",
      headerName: "Flat",
      width: 120,
      flex: 0.8,
      minWidth: 80,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 140,
      flex: 1,
      minWidth: 120,
      renderCell: (params: any) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          color="text.primary"
          sx={{ mt: 2 }}
        >
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: "reason",
      headerName: "Reason",
      width: 220,
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: "is_paid",
      headerName: "Status",
      width: 120,
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: any) => (
        <Chip
          label={params.value ? "Paid" : "Pending"}
          color={params.value ? "success" : "warning"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "paid_at",
      headerName: "Paid Date",
      width: 140,
      flex: 1,
      minWidth: 120,
      renderCell: (params: any) => (
        <Typography
          variant="body2"
          color={params.value ? "text.primary" : "text.secondary"}
        >
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: "Actions",
      width: 150,
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const fine = params.row;

        if (fine.is_paid) {
          return (
            <Chip
              label="Paid ✓"
              color="success"
              size="small"
              variant="filled"
            />
          );
        }

        return (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handlePayment(fine)}
            disabled={isPaymentLoading}
            sx={{
              minWidth: 80,
              fontSize: "0.75rem",
              py: 0.5,
            }}
          >
            {isPaymentLoading ? "Processing..." : "Pay Now"}
          </Button>
        );
      },
    },
  ];

  return (
    <Box height="calc(100vh - 180px)">
      <CommonDataGrid
        rows={fines}
        columns={columns}
        loading={loadingFines}
        height="calc(100vh - 110px)"
        pageSize={20}
      />

      {/* Payment Status Snackbar */}
      <Snackbar
        open={paymentAlert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={paymentAlert.severity}
          variant="filled"
        >
          {paymentAlert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
