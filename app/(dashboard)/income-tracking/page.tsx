"use client";

import CommonButton from "@/components/common/CommonButton";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  createIncomeTracking,
  fetchIncomeTracking,
  fetchIncomeTrackingBySocietyForAdmin,
} from "@/services/income-tracking";
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
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema with translations
export default function incomeTrackingPage() {
  const t = useTranslations("IncomeTrackingPage");

  const inputSchema = z.object({
    society_id: z.string().min(1, t("errors.societyRequired")),
    income_type: z.string().min(1, t("errors.incomeTypeRequired")),
    income_reason: z.string().min(1, t("errors.incomeReasonRequired")),
    income_amount: z
      .string()
      .min(1, t("errors.amountRequired"))
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        t("errors.amountInvalid")
      ),
    income_month: z.string().min(1, t("errors.monthRequired")),
    income_year: z.string().min(4, t("errors.yearRequired")),
  });

  type FormInputValues = z.infer<typeof inputSchema>;

  const formatMonthYear = (value: string) => {
    const [month, year] = value.split("-");
    return `${new Date(Number(year), Number(month) - 1).toLocaleString(
      "default",
      {
        month: "long",
      }
    )} ${year}`;
  };

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [adminSocietyId, setAdminSocietyId] = useState<string | null>(null);

  const currentMonthYear = `${
    new Date().getMonth() + 1
  }-${new Date().getFullYear()}`;
  const [selectedMonthYear, setSelectedMonthYear] =
    useState<string>(currentMonthYear);

  useEffect(() => {
    setRole(getUserRole());
    setAdminSocietyId(getSocietyIdFromLocalStorage());
  }, []);

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
    enabled: role === "super_admin",
  });

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ["incomes", role, adminSocietyId],
    queryFn: async () => {
      if (role === "admin" && adminSocietyId) {
        return fetchIncomeTrackingBySocietyForAdmin(adminSocietyId);
      }
      return fetchIncomeTracking();
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
      income_type: "",
      income_reason: "",
      income_amount: "",
      income_month: `${new Date().getMonth() + 1}`,
      income_year: `${new Date().getFullYear()}`,
    },
  });

  const mutation = useMutation({
    mutationFn: ({
      society_id,
      income_amount,
      income_month,
      income_year,
      ...payload
    }: FormInputValues) =>
      createIncomeTracking(society_id, {
        ...payload,
        income_amount: Number(income_amount),
        income_month: Number(income_month),
        income_year: Number(income_year),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      setOpen(false);
      reset();
    },
  });

  const handleOpen = () => {
    reset({
      society_id: role === "admin" ? adminSocietyId || "" : "",
      income_type: "",
      income_reason: "",
      income_amount: "",
      income_month: `${new Date().getMonth() + 1}`,
      income_year: `${new Date().getFullYear()}`,
    });
    setOpen(true);
  };

  const monthYearOptions = useMemo(() => {
    const unique = new Set(
      (incomes || []).map((e: any) => `${e.income_month}-${e.income_year}`)
    );
    return Array.from(unique);
  }, [incomes]);

  const filteredincomes = useMemo(() => {
    return incomes?.filter(
      (e: any) => `${e.income_month}-${e.income_year}` === selectedMonthYear
    );
  }, [incomes, selectedMonthYear]);

  const columns = useMemo(
    () => [
      { field: "income_type", headerName: t("columns.type"), flex: 1 },
      { field: "income_reason", headerName: t("columns.reason"), flex: 2 },
      { field: "income_amount", headerName: t("columns.amount"), flex: 1 },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: t("columns.society"), flex: 1 }]
        : []),
      { field: "income_month", headerName: t("columns.month"), flex: 1 },
      { field: "income_year", headerName: t("columns.year"), flex: 1 },
      {
        field: "action_by",
        headerName: t("columns.actionBy"),
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
    [role, t]
  );

  return (
    <Box height="calc(100vh - 180px)">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              borderRadius: 1,
              border: "1px solid #1e1ee4",
              color: "#1e1ee4",
            }}
          >
            {t("buttons.addIncome")}
          </Button>

          <FormControl size="small">
            <InputLabel>{t("filters.filterMonth")}</InputLabel>
            <Select
              value={selectedMonthYear}
              label={t("filters.filterMonth")}
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
        rows={filteredincomes || []}
        columns={columns}
        loading={isLoading}
        height="calc(100vh - 180px)"
        pageSize={20}
      />

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {t("dialog.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("dialog.subtitle")}
          </Typography>
        </DialogTitle>

        <Box
          component="form"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {role === "admin" ? (
              <Box>
                <Typography variant="subtitle2">
                  {t("fields.society")}
                </Typography>
                <Chip
                  label={
                    societies.find((s: any) => s.id === adminSocietyId)?.name ||
                    t("labels.selectedSociety")
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
                    <InputLabel>{t("fields.society")}</InputLabel>
                    <Select
                      {...field}
                      label={t("fields.society")}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            "& .MuiMenuItem-root": { fontSize: "0.875rem" },
                          },
                        },
                      }}
                    >
                      {loadingSocieties ? (
                        <MenuItem disabled>{t("labels.loading")}</MenuItem>
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
              name="income_month"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("fields.month")}
                  type="number"
                  error={!!errors.income_month}
                  helperText={errors.income_month?.message}
                  fullWidth
                />
              )}
            />

            {/* Year */}
            <Controller
              name="income_year"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("fields.year")}
                  type="number"
                  error={!!errors.income_year}
                  helperText={errors.income_year?.message}
                  fullWidth
                />
              )}
            />

            {/* Type */}
            <Controller
              name="income_type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.income_type}>
                  <InputLabel>{t("fields.incomeType")}</InputLabel>
                  <Select
                    {...field}
                    label={t("fields.incomeType")}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          "& .MuiMenuItem-root": { fontSize: "0.875rem" },
                        },
                      },
                    }}
                  >
                    <MenuItem value="fixed">{t("labels.fixed")}</MenuItem>
                    <MenuItem value="monthly">{t("labels.monthly")}</MenuItem>
                  </Select>
                  {errors.income_type && (
                    <Typography color="error" variant="caption">
                      {errors.income_type.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Reason */}
            <Controller
              name="income_reason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("fields.reason")}
                  placeholder={t("placeholders.reason")}
                  error={!!errors.income_reason}
                  helperText={errors.income_reason?.message}
                  fullWidth
                />
              )}
            />

            {/* Amount */}
            <Controller
              name="income_amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("fields.amount")}
                  placeholder={t("placeholders.amount")}
                  type="number"
                  error={!!errors.income_amount}
                  helperText={errors.income_amount?.message}
                  fullWidth
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              {t("buttons.cancel")}
            </Button>
            <CommonButton
              type="submit"
              variant="contained"
              loading={mutation.isPending}
              sx={{ bgcolor: "#1e1ee4" }}
            >
              {t("buttons.saveIncome")}
            </CommonButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
