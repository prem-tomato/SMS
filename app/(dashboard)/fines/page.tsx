// "use client";

// import CommonDataGrid from "@/components/common/CommonDataGrid";
// import { useRazorpay } from "@/hooks/useRazorpay";
// import {
//   getSocietyIdFromLocalStorage,
//   getSocietyTypeFromLocalStorage,
// } from "@/lib/auth";
// import { fetchFinesBySocietyId } from "@/services/fines";
// import { fetchSocietyById } from "@/services/societies";
// import { Alert, Box, Button, Chip, Snackbar, Typography } from "@mui/material";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect, useState } from "react";

// export default function Fines() {
//   const [societyId, setSocietyId] = useState<string>("");
//   const [societyType, setSocietyType] = useState<string>("");
//   const [paymentAlert, setPaymentAlert] = useState<{
//     open: boolean;
//     message: string;
//     severity: "success" | "error";
//   }>({ open: false, message: "", severity: "success" });

//   const queryClient = useQueryClient();
//   const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();

//   console.log("societyType", societyType);

//   useEffect(() => {
//     setSocietyType(getSocietyTypeFromLocalStorage()!);
//     setSocietyId(getSocietyIdFromLocalStorage()!);
//   }, []);

//   const { data: fines = [], isLoading: loadingFines } = useQuery({
//     queryKey: ["fines", societyId],
//     queryFn: async () => {
//       return fetchFinesBySocietyId(societyId);
//     },
//     enabled: !!societyId,
//   });

//   const { data: societyInfo } = useQuery({
//     queryKey: ["society", societyId],
//     queryFn: () => fetchSocietyById(societyId),
//     enabled: !!societyId,
//   });

//   const handlePayment = async (fine: any) => {
//     await initiatePayment({
//       fineId: fine.id,
//       amount: fine.amount,
//       reason: fine.reason,
//       society_id: societyId,
//       society_type: societyInfo!.society_type,
//       onSuccess: () => {
//         setPaymentAlert({
//           open: true,
//           message: "Payment completed successfully!",
//           severity: "success",
//         });
//         // Refresh the fines data
//         queryClient.invalidateQueries({ queryKey: ["fines", societyId] });
//       },
//       onFailure: (error) => {
//         setPaymentAlert({
//           open: true,
//           message: "Payment failed. Please try again.",
//           severity: "error",
//         });
//         console.error("Payment failed:", error);
//       },
//     });
//   };

//   const handleCloseAlert = () => {
//     setPaymentAlert((prev) => ({ ...prev, open: false }));
//   };

//   // Format currency
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     }).format(amount);
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     if (!dateString) return "Not Paid";
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const columns = [
//     ...(societyType !== "housing"
//       ? [
//           {
//             field: "building_name",
//             headerName: "Building",
//             width: 180,
//             flex: 1,
//             minWidth: 120,
//           },
//           {
//             field: "flat_number",
//             headerName: "Flat",
//             width: 120,
//             flex: 0.8,
//             minWidth: 80,
//           },
//         ]
//       : []),
//     ...(societyType === "housing"
//       ? [
//           {
//             field: "unit_number",
//             headerName: "Unit",
//             width: 120,
//             flex: 0.8,
//             minWidth: 80,
//           },
//         ]
//       : []),
//     {
//       field: "amount",
//       headerName: "Amount",
//       width: 140,
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params: any) => (
//         <Typography
//           variant="body2"
//           fontWeight="medium"
//           color="text.primary"
//           sx={{ mt: 2 }}
//         >
//           {formatCurrency(params.value)}
//         </Typography>
//       ),
//     },
//     {
//       field: "reason",
//       headerName: "Reason",
//       width: 220,
//       flex: 1.5,
//       minWidth: 180,
//     },
//     {
//       field: "is_paid",
//       headerName: "Status",
//       width: 120,
//       flex: 0.8,
//       minWidth: 100,
//       renderCell: (params: any) => (
//         <Chip
//           label={params.value ? "Paid" : "Pending"}
//           color={params.value ? "success" : "warning"}
//           size="small"
//           variant="outlined"
//         />
//       ),
//     },
//     {
//       field: "paid_at",
//       headerName: "Paid Date",
//       width: 140,
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params: any) => (
//         <Typography
//           variant="body2"
//           color={params.value ? "text.primary" : "text.secondary"}
//           sx={{ mt: 2 }}
//         >
//           {formatDate(params.value)}
//         </Typography>
//       ),
//     },
//     {
//       field: "action",
//       headerName: "Actions",
//       width: 150,
//       flex: 1,
//       minWidth: 120,
//       sortable: false,
//       filterable: false,
//       renderCell: (params: any) => {
//         const fine = params.row;
//         console.log("fine", fine);

//         if (fine.is_paid) {
//           return (
//             <Chip
//               label="Paid ✓"
//               color="success"
//               size="small"
//               variant="filled"
//             />
//           );
//         }

//         return (
//           <Button
//             variant="contained"
//             color="primary"
//             size="small"
//             onClick={() => handlePayment(fine)}
//             disabled={isPaymentLoading}
//             sx={{
//               minWidth: 80,
//               fontSize: "0.75rem",
//               py: 0.5,
//             }}
//           >
//             {isPaymentLoading ? "Processing..." : "Pay Now"}
//           </Button>
//         );
//       },
//     },
//   ];

//   return (
//     <Box height="calc(100vh - 180px)">
//       <CommonDataGrid
//         rows={fines}
//         columns={columns}
//         loading={loadingFines}
//         height="calc(100vh - 110px)"
//         pageSize={20}
//       />

//       {/* Payment Status Snackbar */}
//       <Snackbar
//         open={paymentAlert.open}
//         autoHideDuration={6000}
//         onClose={handleCloseAlert}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <Alert
//           onClose={handleCloseAlert}
//           severity={paymentAlert.severity}
//           variant="filled"
//         >
//           {paymentAlert.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }
"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import { useRazorpay } from "@/hooks/useRazorpay";
import {
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
} from "@/lib/auth";
import { fetchFinesBySocietyId } from "@/services/fines";
import { fetchSocietyById } from "@/services/societies";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Chip,
  Fade,
  Modal,
  Snackbar,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// TypeScript interfaces
interface PaymentAlert {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

interface SuccessModal {
  open: boolean;
  amount: number;
  reason: string;
}

interface Fine {
  id: string;
  amount: number;
  reason: string;
  is_paid: boolean;
  paid_at?: string;
  building_name?: string;
  flat_number?: string;
  unit_number?: string;
}

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  reason: string;
}

interface ConfettiParticle {
  id: number;
  left: number;
  animationDelay: number;
  color: string;
}

// Keyframe animations
const bounceIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const confettiAnimation = keyframes`
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    box-shadow: 0 0 0 40px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

// Success Modal Component
const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  open,
  onClose,
  amount,
  reason,
}) => {
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [open, onClose]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Generate confetti particles
  const confettiParticles: ConfettiParticle[] = Array.from(
    { length: 50 },
    (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 2,
      color: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"][
        Math.floor(Math.random() * 5)
      ],
    })
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 300, sm: 400 },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            outline: "none",
          }}
        >
          {/* Confetti */}
          {showConfetti && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1000,
              }}
            >
              {confettiParticles.map((particle: ConfettiParticle) => (
                <Box
                  key={particle.id}
                  sx={{
                    position: "absolute",
                    left: `${particle.left}%`,
                    width: "10px",
                    height: "10px",
                    backgroundColor: particle.color,
                    animation: `${confettiAnimation} 3s ease-out forwards`,
                    animationDelay: `${particle.animationDelay}s`,
                  }}
                />
              ))}
            </Box>
          )}

          {/* Success Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: "#4caf50",
                animation: `${bounceIn} 0.6s ease-out, ${pulseGlow} 2s infinite`,
              }}
            />
          </Box>

          {/* Success Text */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#4caf50",
              mb: 1,
              animation: `${bounceIn} 0.8s ease-out 0.2s both`,
            }}
          >
            Payment Successful!
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: "medium",
              mb: 1,
              animation: `${bounceIn} 0.8s ease-out 0.4s both`,
            }}
          >
            {formatCurrency(amount)}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 3,
              animation: `${bounceIn} 0.8s ease-out 0.6s both`,
            }}
          >
            {reason}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              animation: `${bounceIn} 0.8s ease-out 0.8s both`,
            }}
          >
            <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Transaction completed successfully
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default function Fines() {
  const [societyId, setSocietyId] = useState<string>("");
  const [societyType, setSocietyType] = useState<string>("");
  const [paymentAlert, setPaymentAlert] = useState<PaymentAlert>({
    open: false,
    message: "",
    severity: "success",
  });

  // Success modal state
  const [successModal, setSuccessModal] = useState<SuccessModal>({
    open: false,
    amount: 0,
    reason: "",
  });

  // Track loading state for individual fines
  const [loadingFines, setLoadingFines] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { initiatePayment } = useRazorpay();

  console.log("societyType", societyType);

  useEffect(() => {
    setSocietyType(getSocietyTypeFromLocalStorage()!);
    setSocietyId(getSocietyIdFromLocalStorage()!);
  }, []);

  const { data: fines = [], isLoading: loadingFinesData } = useQuery({
    queryKey: ["fines", societyId],
    queryFn: async () => {
      return fetchFinesBySocietyId(societyId);
    },
    enabled: !!societyId,
  });

  const { data: societyInfo } = useQuery({
    queryKey: ["society", societyId],
    queryFn: () => fetchSocietyById(societyId),
    enabled: !!societyId,
  });

  const handlePayment = async (fine: Fine) => {
    // Add this fine to loading set
    setLoadingFines((prev) => new Set(prev).add(fine.id));

    try {
      await initiatePayment({
        fineId: fine.id,
        amount: fine.amount,
        reason: fine.reason,
        society_id: societyId,
        society_type: societyInfo!.society_type,
        onSuccess: () => {
          // Show success modal with animation
          setSuccessModal({
            open: true,
            amount: fine.amount,
            reason: fine.reason,
          });

          // Also show the snackbar (optional, you can remove this if you prefer only the modal)
          setPaymentAlert({
            open: true,
            message: "Payment completed successfully!",
            severity: "success",
          });

          // Refresh the fines data
          queryClient.invalidateQueries({ queryKey: ["fines", societyId] });
        },
        onFailure: (error: any) => {
          setPaymentAlert({
            open: true,
            message: "Payment failed. Please try again.",
            severity: "error",
          });
          console.error("Payment failed:", error);
        },
      });
    } finally {
      // Remove this fine from loading set
      setLoadingFines((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fine.id);
        return newSet;
      });
    }
  };

  const handleCloseAlert = () => {
    setPaymentAlert((prev) => ({ ...prev, open: false }));
  };

  const handleCloseSuccessModal = () => {
    setSuccessModal({ open: false, amount: 0, reason: "" });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Not Paid";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    ...(societyType !== "housing"
      ? [
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
        ]
      : []),
    ...(societyType === "housing"
      ? [
          {
            field: "unit_number",
            headerName: "Unit",
            width: 120,
            flex: 0.8,
            minWidth: 80,
          },
        ]
      : []),
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
          sx={{ mt: 2 }}
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
        const isCurrentlyLoading = loadingFines.has(fine.id);
        console.log("fine", fine);

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
            disabled={isCurrentlyLoading}
            sx={{
              minWidth: 80,
              fontSize: "0.75rem",
              py: 0.5,
            }}
          >
            {isCurrentlyLoading ? "Processing..." : "Pay Now"}
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
        loading={loadingFinesData}
        height="calc(100vh - 110px)"
        pageSize={20}
      />

      {/* Payment Success Modal with Animation */}
      <PaymentSuccessModal
        open={successModal.open}
        onClose={handleCloseSuccessModal}
        amount={successModal.amount}
        reason={successModal.reason}
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
