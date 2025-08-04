"use client";

import { GetMemberMonthlyDuesResponse } from "@/app/api/member-monthly-dues/member-monthly-dues.types";
import {
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
  getUserRole,
} from "@/lib/auth";
import { getDuesYearMonth } from "@/services/manage-flat-maintenance";
import {
  bulkMonetize,
  getMemberMonthlyDueRecord,
  getMembersMonthlyDues,
  getMembersMonthlyDuesForAdmin,
  updateMemberMonthlyDues,
} from "@/services/members-monthly-dues";
import ClearIcon from "@mui/icons-material/Clear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentIcon from "@mui/icons-material/Payment";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function MemberMonthlyDues() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<string>("");
  const [adminSocietyId, setAdminSocietyId] = useState<string>("");
  
  // FIX: Initialize selectedMonth as empty string to avoid timing issues
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState<string>("society_name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(true);
  const [societyType, setSocietyType] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    society: "",
    building: "",
    flat: "",
    member: "",
    status: "all", // 'all', 'paid', 'unpaid'
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const userRole = getUserRole();
    const society = getSocietyIdFromLocalStorage();
    const societyType = getSocietyTypeFromLocalStorage();
    setRole(userRole!);
    setAdminSocietyId(society!);
    setSocietyType(societyType);
  }, []);

  const { mutateAsync: updateDues, isPending } = useMutation({
    mutationFn: ({
      societyId,
      buildingId,
      flatId,
      recordId,
      payload,
    }: {
      societyId: string;
      buildingId: string;
      flatId: string;
      recordId: string;
      payload: { maintenance_paid?: boolean; penalty_paid?: boolean };
    }) =>
      updateMemberMonthlyDues(societyId, buildingId, flatId, recordId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-monthly-dues"] });
    },
  });

  const { mutateAsync: bulkMonetizeDues, isPending: isBulkPending } =
    useMutation({
      mutationFn: bulkMonetize,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["member-monthly-dues"] });
        setSelectedRows([]);
        setSnackbar({
          open: true,
          message: "Bulk payment processed successfully!",
          severity: "success",
        });
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: error.message || "Failed to process bulk payment",
          severity: "error",
        });
      },
    });

  // FIX: Load available months first and extract month_year strings
  const { data: availableMonthsRaw = [], isLoading: loadingAvailableMonths } =
    useQuery({
      queryKey: ["dues-year-month"],
      queryFn: getDuesYearMonth,
    });

  // FIX: Extract month_year strings from the API response
  const availableMonths = availableMonthsRaw.map((item: any) => item.month_year);

  // FIX: Set selectedMonth after availableMonths loads
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      const currentMonth = dayjs().startOf("month").format("YYYY-MM-DD");
      // Use current month if available, otherwise use the latest available month
      const monthToSelect = availableMonths.includes(currentMonth) 
        ? currentMonth 
        : availableMonths[availableMonths.length - 1];
      
      // FIX: Ensure monthToSelect is a string
      console.log("Setting selectedMonth to:", monthToSelect, typeof monthToSelect);
      if (typeof monthToSelect === 'string') {
        setSelectedMonth(monthToSelect);
      }
    }
  }, [availableMonths, selectedMonth]);

  const { data: MemberMonthlyDues = [], isLoading: loadingMemberMonthlyDues } =
    useQuery({
      queryKey: ["member-monthly-dues", selectedMonth],
      queryFn: async () => {
        console.log("API call with selectedMonth:", selectedMonth, typeof selectedMonth);
        
        // FIX: Additional validation before API call
        if (!selectedMonth || typeof selectedMonth !== 'string') {
          console.error("Invalid selectedMonth:", selectedMonth);
          return [];
        }
        
        if (role === "admin" && adminSocietyId) {
          return await getMembersMonthlyDuesForAdmin(
            adminSocietyId,
            selectedMonth
          );
        }
        return await getMembersMonthlyDues(selectedMonth);
      },
      // FIX: Only run query when selectedMonth is available AND is a string
      enabled: !!role && !!selectedMonth && typeof selectedMonth === 'string',
    });

  const handleBulkMonetize = async () => {
    if (selectedRows.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one record",
        severity: "error",
      });
      return;
    }

    try {
      await bulkMonetizeDues(selectedRows);
    } catch (error) {
      console.error("Bulk monetize error:", error);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = sortedData.map((row: any) => row.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      society: "",
      building: "",
      flat: "",
      member: "",
      status: "all",
    });
    setPage(0);
  };

  const hasActiveFilters = Object.values(filters).some(
    (val) => val && val !== "all"
  );

  // Sorting function
  const sortData = (data: any[], orderBy: string, order: "asc" | "desc") => {
    return [...data].sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      if (orderBy === "member_name") {
        aVal = (a.member_name || []).join(", ").toLowerCase();
        bVal = (b.member_name || []).join(", ").toLowerCase();
      } else if (orderBy === "month_year") {
        aVal = new Date(a.month_year).getTime();
        bVal = new Date(b.month_year).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (order === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  };

  // Filtering function
  const filterData = (data: any[]) => {
    return data.filter((row) => {
      const societyMatch =
        !filters.society ||
        row.society_name.toLowerCase().includes(filters.society.toLowerCase());

      const buildingMatch =
        !filters.building ||
        row.building_name
          .toLowerCase()
          .includes(filters.building.toLowerCase());

      const safeIncludes = (value: string | null | undefined, filter: string) =>
        (value ?? "").toLowerCase().includes(filter.toLowerCase());

      const flatMatch =
        !filters.flat || safeIncludes(row.unit_identifier, filters.flat);

      const memberMatch =
        !filters.member ||
        (row.member_name || []).some((name: string) =>
          name.toLowerCase().includes(filters.member.toLowerCase())
        );

      const statusMatch =
        filters.status === "all" ||
        (filters.status === "paid" && row.maintenance_paid) ||
        (filters.status === "unpaid" && !row.maintenance_paid);

      return (
        societyMatch && buildingMatch && flatMatch && memberMatch && statusMatch
      );
    });
  };

  // Apply filtering and sorting
  const filteredData = filterData(MemberMonthlyDues);
  const sortedData = sortData(filteredData, orderBy, order);
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const unpaidSelectedCount = selectedRows.filter((id) => {
    const record = sortedData.find((row: any) => row.id === String(id));
    return record && !record.maintenance_paid;
  }).length;

  const ActionCell = ({ row }: { row: GetMemberMonthlyDuesResponse }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [openDialog, setOpenDialog] = useState(false);
    const [recordDetails, setRecordDetails] = useState<any>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleUpdate = async (payload: { maintenance_paid?: boolean }) => {
      handleClose();
      await updateDues({
        societyId: row.society_id,
        buildingId: row.building_id,
        flatId: row.flat_id,
        recordId: row.id,
        payload,
      });
    };

    const handleView = async () => {
      handleClose();
      try {
        const res = await getMemberMonthlyDueRecord(row.id);
        setRecordDetails(res);
        setOpenDialog(true);
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <>
        <Tooltip title="Actions">
          <IconButton
            size="small"
            onClick={handleOpen}
            sx={{
              color: "#666",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                color: "#333",
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleView}>View Record</MenuItem>
          {!row.maintenance_paid && (
            <MenuItem
              disabled={isPending}
              onClick={() => handleUpdate({ maintenance_paid: true })}
            >
              Mark Maintenance Paid
            </MenuItem>
          )}
        </Menu>
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Monthly Due Record</DialogTitle>
          <DialogContent dividers>
            {recordDetails ? (
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Unit Details</Typography>

                  <Typography variant="body2">
                    <strong>Society:</strong> {recordDetails.society_name}
                  </Typography>

                  {recordDetails.building_name && (
                    <Typography variant="body2">
                      <strong>Building:</strong> {recordDetails.building_name}
                    </Typography>
                  )}

                  <Typography variant="body2">
                    <strong>
                      {recordDetails.property_type === "commercial"
                        ? "Shop"
                        : recordDetails.property_type === "housing"
                        ? "Bungalow"
                        : "Flat"}
                      :
                    </strong>{" "}
                    {recordDetails.unit_identifier}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Month:</strong>{" "}
                    {dayjs(recordDetails.month_year).format("MMMM YYYY")}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Member(s):</strong>{" "}
                    {(recordDetails.member_name || []).join(", ")}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Charges</Typography>
                  <Typography variant="body2">
                    <strong>Maintenance:</strong> ₹
                    {recordDetails.maintenance_amount}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Payment Status</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2">Maintenance Paid:</Typography>
                    <Chip
                      label={recordDetails.maintenance_paid ? "Yes" : "No"}
                      color={
                        recordDetails.maintenance_paid ? "success" : "error"
                      }
                      size="small"
                    />
                  </Stack>
                  {recordDetails.maintenance_paid_at && (
                    <Typography variant="caption" mt={0.5}>
                      {dayjs(recordDetails.maintenance_paid_at).format(
                        "YYYY-MM-DD HH:mm"
                      )}
                    </Typography>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Action Info</Typography>
                  <Typography variant="body2">
                    <strong>Action By:</strong> {recordDetails.action_by}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Action At:</strong>{" "}
                    {recordDetails.action_at
                      ? dayjs(recordDetails.action_at).format(
                          "YYYY-MM-DD HH:mm"
                        )
                      : "-"}
                  </Typography>
                </Paper>
              </Stack>
            ) : (
              <Typography>Loading...</Typography>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  };

  // FIX: Show loading state while months or initial data is loading
  if (loadingAvailableMonths || (loadingMemberMonthlyDues && !selectedMonth)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const headCellStyle = (key?: string): SxProps => ({
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
    fontWeight: 600,
    color: "#495057",
    py: 2,
  });

  const bodyCellStyle = (
    variant: "bold" | "muted" | "normal" = "normal"
  ): SxProps => ({
    py: 2,
    color: variant === "muted" ? "#6c757d" : "#495057",
    fontWeight: variant === "bold" ? 500 : 400,
  });

  return (
    <Box sx={{ height: "calc(100vh - 180px)", backgroundColor: "#fafafa" }}>
      {/* Header Section */}
      <Card sx={{ mb: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ pb: "16px !important" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="600" color="#333">
              Monthly Dues Management
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="month-select-label">Select Month</InputLabel>
                <Select
                  labelId="month-select-label"
                  value={selectedMonth}
                  label="Select Month"
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log("Month selection changed:", value, typeof value);
                    // FIX: Ensure value is string before setting
                    if (typeof value === 'string') {
                      setSelectedMonth(value);
                    }
                  }}
                  sx={{ backgroundColor: "white" }}
                  disabled={loadingAvailableMonths}
                >
                  {availableMonths.map((month: string) => (
                    <MenuItem key={month} value={month}>
                      {dayjs(month).format("MMMM YYYY")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* FIX: Show loading indicator */}
              {loadingAvailableMonths && (
                <CircularProgress size={16} />
              )}
              
              {/* FIX: Show message when no months available */}
              {availableMonths.length === 0 && !loadingAvailableMonths && (
                <Typography variant="body2" color="error">
                  No months available
                </Typography>
              )}
            </Stack>
          </Stack>

          {/* Filter Section - Always Visible */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              {/* 🔹 Society filter for super admins */}
              {role === "super_admin" && (
                <TextField
                  size="small"
                  label="Society"
                  value={filters.society}
                  onChange={(e) =>
                    handleFilterChange("society", e.target.value)
                  }
                  sx={{
                    minWidth: 140,
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                    },
                  }}
                />
              )}

              {/* 🔹 Building filter — shown only for non-housing */}
              {societyType !== "housing" && (
                <TextField
                  size="small"
                  label="Building"
                  value={filters.building}
                  onChange={(e) =>
                    handleFilterChange("building", e.target.value)
                  }
                  sx={{
                    minWidth: 140,
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                    },
                  }}
                />
              )}

              {/* 🔹 Flat/Unit/Shop filter */}
              <TextField
                size="small"
                label={
                  societyType === "commercial"
                    ? "Shop"
                    : societyType === "housing"
                    ? "Unit"
                    : "Flat"
                }
                value={filters.flat}
                onChange={(e) => handleFilterChange("flat", e.target.value)}
                sx={{
                  minWidth: 120,
                  backgroundColor: "white",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                }}
              />

              {/* 🔹 Member filter */}
              <TextField
                size="small"
                label={
                  societyType === "commercial"
                    ? "Owner"
                    : societyType === "housing"
                    ? "Resident"
                    : "Resident"
                }
                value={filters.member}
                onChange={(e) => handleFilterChange("member", e.target.value)}
                sx={{
                  minWidth: 140,
                  backgroundColor: "white",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                }}
              />

              {/* 🔹 Status filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>

              {/* 🔹 Clear filters */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                sx={{
                  borderColor: "#e0e0e0",
                  color: "#666",
                  textTransform: "none",
                }}
              >
                Clear
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Footer section with counts and bulk actions */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                Showing {filteredData.length} of {MemberMonthlyDues.length}{" "}
                records
              </Typography>

              {selectedRows.length > 0 && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="primary" fontWeight={500}>
                    {selectedRows.length} selected ({unpaidSelectedCount}{" "}
                    unpaid)
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PaymentIcon />}
                    onClick={handleBulkMonetize}
                    disabled={isBulkPending || unpaidSelectedCount === 0}
                    size="small"
                    sx={{
                      backgroundColor: "#1976d2",
                      textTransform: "none",
                      fontWeight: 500,
                      boxShadow: "0 2px 4px rgba(25,118,210,0.3)",
                    }}
                  >
                    {isBulkPending
                      ? "Processing..."
                      : `Mark ${unpaidSelectedCount} as Paid`}
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 400px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell
                  padding="checkbox"
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                    py: 2,
                  }}
                >
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < sortedData.length
                    }
                    checked={
                      sortedData.length > 0 &&
                      selectedRows.length === sortedData.length
                    }
                    onChange={handleSelectAll}
                    sx={{ color: "#1976d2" }}
                  />
                </TableCell>

                {/* Society Name */}
                <TableCell sx={headCellStyle("society_name")}>
                  Society
                </TableCell>

                {/* Building Name (hide if housing) */}
                {societyType !== "housing" && (
                  <TableCell sx={headCellStyle("building_name")}>
                    <TableSortLabel
                      active={orderBy === "building_name"}
                      direction={orderBy === "building_name" ? order : "asc"}
                      onClick={() => handleSort("building_name")}
                    >
                      Building
                    </TableSortLabel>
                  </TableCell>
                )}

                {/* Flat/Shop/Unit */}
                <TableCell sx={headCellStyle("unit_identifier")}>
                  <TableSortLabel
                    active={orderBy === "unit_identifier"}
                    direction={orderBy === "unit_identifier" ? order : "asc"}
                    onClick={() => handleSort("unit_identifier")}
                  >
                    {societyType === "commercial"
                      ? "Shop No"
                      : societyType === "housing"
                      ? "Unit No"
                      : "Flat No"}
                  </TableSortLabel>
                </TableCell>

                {/* Members */}
                <TableCell sx={headCellStyle("member_name")}>
                  <TableSortLabel
                    active={orderBy === "member_name"}
                    direction={orderBy === "member_name" ? order : "asc"}
                    onClick={() => handleSort("member_name")}
                  >
                    Members
                  </TableSortLabel>
                </TableCell>

                {/* Month */}
                <TableCell sx={headCellStyle("month_year")}>
                  <TableSortLabel
                    active={orderBy === "month_year"}
                    direction={orderBy === "month_year" ? order : "asc"}
                    onClick={() => handleSort("month_year")}
                  >
                    Month
                  </TableSortLabel>
                </TableCell>

                {/* Maintenance Amount */}
                <TableCell sx={headCellStyle("maintenance_amount")}>
                  <TableSortLabel
                    active={orderBy === "maintenance_amount"}
                    direction={orderBy === "maintenance_amount" ? order : "asc"}
                    onClick={() => handleSort("maintenance_amount")}
                  >
                    Maintenance
                  </TableSortLabel>
                </TableCell>

                {/* Status */}
                <TableCell sx={headCellStyle("maintenance_paid")}>
                  <TableSortLabel
                    active={orderBy === "maintenance_paid"}
                    direction={orderBy === "maintenance_paid" ? order : "asc"}
                    onClick={() => handleSort("maintenance_paid")}
                  >
                    Maintenance Status
                  </TableSortLabel>
                </TableCell>

                {/* Actions */}
                <TableCell sx={headCellStyle()}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((row: any) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#f8f9fa" },
                    "&:nth-of-type(even)": { backgroundColor: "#fafafa" },
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <TableCell padding="checkbox" sx={{ py: 2 }}>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      sx={{ color: "#1976d2" }}
                    />
                  </TableCell>

                  <TableCell sx={bodyCellStyle()}>{row.society_name}</TableCell>

                  {societyType !== "housing" && (
                    <TableCell sx={bodyCellStyle("muted")}>
                      {row.building_name || "-"}
                    </TableCell>
                  )}

                  <TableCell sx={bodyCellStyle("bold")}>
                    {row.unit_identifier || "-"}
                  </TableCell>

                  <TableCell sx={bodyCellStyle("muted")}>
                    {(row.member_name || []).join(", ") || "No members"}
                  </TableCell>

                  <TableCell sx={bodyCellStyle("muted")}>
                    {dayjs(row.month_year).format("YYYY-MM-DD")}
                  </TableCell>

                  <TableCell sx={bodyCellStyle("bold")}>
                    ₹{row.maintenance_amount?.toLocaleString() || "0"}
                  </TableCell>

                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={row.maintenance_paid ? "Paid" : "Unpaid"}
                      sx={{
                        backgroundColor: row.maintenance_paid
                          ? "#d4edda"
                          : "#f8d7da",
                        color: row.maintenance_paid ? "#155724" : "#721c24",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        height: 24,
                        borderRadius: "12px",
                        "& .MuiChip-label": { px: 1.5 },
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ py: 2 }}>
                    <ActionCell row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #dee2e6",
            backgroundColor: "#FAFAFA",
            "& .MuiTablePagination-select": {
              borderRadius: "4px",
            },
          }}
        />
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}