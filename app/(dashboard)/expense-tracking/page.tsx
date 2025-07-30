"use client";

import CommonButton from "@/components/common/CommonButton";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  createExpenseTracking,
  fetchExpenseTracking,
  fetchExpenseTrackingBySocietyForAdmin,
} from "@/services/expense-tracking";
import { fetchSocietyOptions } from "@/services/societies";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// 🔎 Validation schema
const inputSchema = z.object({
  society_id: z.string().min(1, "Society is required"),
  expense_type: z.string().min(1, "Expense type is required"),
  expense_reason: z.string().min(1, "Expense reason is required"),
  expense_amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a valid number greater than 0"),
  expense_month: z.string().min(1, "Month is required"),
  expense_year: z.string().min(4, "Year is required"),
});

type FormInputValues = z.infer<typeof inputSchema>;

// 🔧 Utility
const formatMonthYear = (value: string) => {
  const [month, year] = value.split("-");
  return `${new Date(Number(year), Number(month) - 1).toLocaleString("default", {
    month: "long",
  })} ${year}`;
};

export default function ExpenseTrackingPage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [adminSocietyId, setAdminSocietyId] = useState<string | null>(null);

  const currentMonthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(currentMonthYear);

  useEffect(() => {
    setRole(getUserRole());
    setAdminSocietyId(getSocietyIdFromLocalStorage());
  }, []);

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
    enabled: role === "super_admin",
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", role, adminSocietyId],
    queryFn: async () => {
      if (role === "admin" && adminSocietyId) {
        return fetchExpenseTrackingBySocietyForAdmin(adminSocietyId);
      }
      return fetchExpenseTracking();
    },
    enabled: !!role,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      society_id: "",
      expense_type: "",
      expense_reason: "",
      expense_amount: "",
      expense_month: `${new Date().getMonth() + 1}`,
      expense_year: `${new Date().getFullYear()}`,
    },
  });

  const mutation = useMutation({
    mutationFn: ({
      society_id,
      expense_amount,
      expense_month,
      expense_year,
      ...payload
    }: FormInputValues) =>
      createExpenseTracking(society_id, {
        ...payload,
        expense_amount: Number(expense_amount),
        expense_month: Number(expense_month),
        expense_year: Number(expense_year),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: FormInputValues) => {
    mutation.mutate(data);
  };

  const handleOpen = () => {
    reset({
      society_id: role === "admin" ? adminSocietyId || "" : "",
      expense_type: "",
      expense_reason: "",
      expense_amount: "",
      expense_month: `${new Date().getMonth() + 1}`,
      expense_year: `${new Date().getFullYear()}`,
    });
    setOpen(true);
  };

  const monthYearOptions = useMemo(() => {
    const unique = new Set(
      (expenses || []).map((e: any) => `${e.expense_month}-${e.expense_year}`)
    );
    return Array.from(unique);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses?.filter(
      (e: any) => `${e.expense_month}-${e.expense_year}` === selectedMonthYear
    );
  }, [expenses, selectedMonthYear]);

  const columns = useMemo(
    () => [
      { field: "expense_type", headerName: "Type", flex: 1 },
      { field: "expense_reason", headerName: "Reason", flex: 2 },
      { field: "expense_amount", headerName: "Amount", flex: 1 },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: "Society", flex: 1 }]
        : []),
      { field: "expense_month", headerName: "Month", flex: 1 },
      { field: "expense_year", headerName: "Year", flex: 1 },
      {
        field: "action_by",
        headerName: "Action By",
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params.value}
            size="small"
            color="primary"
            sx={{ fontSize: "0.75rem" }}
          />
        ),
      },
    ],
    [role]
  );

  return (
    <Box height="calc(100vh - 180px)">
      {/* Header with Filter & Add */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{ borderRadius: 1, border: "1px solid #1e1ee4", color: "#1e1ee4" }}
          >
            Add Expense
          </Button>

          <FormControl size="small">
            <InputLabel>Filter Month</InputLabel>
            <Select
              value={selectedMonthYear}
              label="Filter Month"
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {monthYearOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {formatMonthYear(opt)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Data Grid */}
      <CommonDataGrid
        rows={filteredExpenses || []}
        columns={columns}
        loading={isLoading}
        height="calc(100vh - 180px)"
        pageSize={20}
      />

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Add New Expense
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter expense details below
          </Typography>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {role === "admin" ? (
              <Box>
                <Typography variant="subtitle2">Society</Typography>
                <Chip
                  label={
                    societies.find((s: any) => s.id === adminSocietyId)?.name || "Selected Society"
                  }
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>
            ) : role === "super_admin" ? (
              <Controller
                name="society_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.society_id}>
                    <InputLabel>Society</InputLabel>
                    <Select {...field} label="Society">
                      {loadingSocieties ? (
                        <MenuItem disabled>Loading...</MenuItem>
                      ) : (
                        societies.map((s: any) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.society_id && (
                      <Typography color="error" variant="caption">
                        {errors.society_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            ) : null}

            {/* Month */}
            <Controller
              name="expense_month"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Month"
                  type="number"
                  error={!!errors.expense_month}
                  helperText={errors.expense_month?.message}
                  fullWidth
                />
              )}
            />

            {/* Year */}
            <Controller
              name="expense_year"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Year"
                  type="number"
                  error={!!errors.expense_year}
                  helperText={errors.expense_year?.message}
                  fullWidth
                />
              )}
            />

            {/* Type */}
            <Controller
              name="expense_type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.expense_type}>
                  <InputLabel>Expense Type</InputLabel>
                  <Select {...field} label="Expense Type">
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                  {errors.expense_type && (
                    <Typography color="error" variant="caption">
                      {errors.expense_type.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Reason */}
            <Controller
              name="expense_reason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Reason"
                  placeholder="e.g., Watchmen salary"
                  error={!!errors.expense_reason}
                  helperText={errors.expense_reason?.message}
                  fullWidth
                />
              )}
            />

            {/* Amount */}
            <Controller
              name="expense_amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount"
                  placeholder="e.g., 10000"
                  type="number"
                  error={!!errors.expense_amount}
                  helperText={errors.expense_amount?.message}
                  fullWidth
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <CommonButton type="submit" variant="contained" loading={mutation.isPending} sx={{ bgcolor: "#1e1ee4" }}>
              Save Expense
            </CommonButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
