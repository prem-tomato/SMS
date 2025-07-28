"use client";

import { GetMemberMonthlyDuesResponse } from "@/app/api/member-monthly-dues/member-monthly-dues.types";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  getMemberMonthlyDueRecord,
  getMembersMonthlyDues,
  getMembersMonthlyDuesForAdmin,
  updateMemberMonthlyDues,
} from "@/services/members-monthly-dues";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Box as MuiBox,
  Paper,
  Select,
  Stack,
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
  const currentMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    const userRole = getUserRole();
    const society = getSocietyIdFromLocalStorage();
    setRole(userRole!);
    setAdminSocietyId(society!);
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

  const { data: MemberMonthlyDues = [], isLoading: loadingMemberMonthlyDues } =
    useQuery({
      queryKey: ["member-monthly-dues", selectedMonth],
      queryFn: async () => {
        if (role === "admin" && adminSocietyId) {
          return await getMembersMonthlyDuesForAdmin(
            adminSocietyId,
            selectedMonth
          );
        }
        return await getMembersMonthlyDues(selectedMonth);
      },
      enabled: !!role && !!selectedMonth,
    });

  const { data: availableMonths = [] } = useQuery({
    queryKey: ["dues-year-month"],
    queryFn: async () => {
      const res = await fetch("/api/dues-year-month");
      if (!res.ok) throw new Error("Failed to fetch months");
      const json = await res.json();
      return json.map((item: any) => item.month_year);
    },
  });

  const columns = [
    { field: "society_name", headerName: "Society", flex: 1 },
    { field: "building_name", headerName: "Building", flex: 1 },
    { field: "flat_number", headerName: "Flat Number", flex: 1 },
    {
      field: "member_name",
      headerName: "Members",
      flex: 2,
      sortable: false,
      renderCell: ({ row }: { row: any }) => (
        <span style={{ fontSize: "0.875rem" }}>
          {(row.member_name || []).join(", ")}
        </span>
      ),
    },

    {
      field: "month_year",
      headerName: "Month",
      flex: 1,
      renderCell: ({ row }: { row: any }) => (
        <span style={{ fontSize: "0.875rem" }}>
          {dayjs(row.month_year).format("YYYY-MM-DD")}
        </span>
      ),
    },
    { field: "maintenance_amount", headerName: "Maintenance", flex: 1 },
    {
      field: "penalty_amount",
      headerName: "Penalty",
      flex: 1,
      renderCell: ({ row }: { row: any }) =>
        row.penalty_amount > 0 ? (
          <span style={{ fontSize: "0.875rem" }}>{row.penalty_amount}</span>
        ) : null,
    },
    { field: "total_due", headerName: "Total Due", flex: 1 },
    {
      field: "maintenance_paid",
      headerName: "Maintenance",
      flex: 1,
      renderCell: ({ row }: { row: any }) => (
        <Chip
          label={row.maintenance_paid ? "Paid" : "Unpaid"}
          sx={{
            backgroundColor: row.maintenance_paid ? "#E6F4EA" : "#FDECEA",
            color: row.maintenance_paid ? "#2E7D32" : "#C62828",
            fontWeight: 500,
            fontSize: "0.8rem",
            borderRadius: "8px",
            px: 1.5,
            height: 28,
          }}
        />
      ),
    },
    {
      field: "penalty_paid",
      headerName: "Penalty",
      flex: 1,
      renderCell: ({ row }: { row: any }) =>
        row.penalty_amount > 0 ? (
          <Chip
            label={row.penalty_paid ? "Paid" : "Unpaid"}
            sx={{
              backgroundColor: row.penalty_paid ? "#E6F4EA" : "#FDECEA",
              color: row.penalty_paid ? "#2E7D32" : "#C62828",
              fontWeight: 500,
              fontSize: "0.8rem",
              borderRadius: "8px",
              px: 1.5,
              height: 28,
            }}
          />
        ) : null,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 1,
      renderCell: ({ row }: { row: GetMemberMonthlyDuesResponse }) => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);
        const hasPenalty = row.penalty_amount > 0;

        const [openDialog, setOpenDialog] = useState(false);
        const [recordDetails, setRecordDetails] = useState<any>(null);

        const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
          setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
          setAnchorEl(null);
        };

        const handleUpdate = async (payload: {
          maintenance_paid?: boolean;
          penalty_paid?: boolean;
        }) => {
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
              <IconButton size="small" onClick={handleOpen}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleView}>View Record</MenuItem>

              <MenuItem
                disabled={isPending}
                onClick={() => handleUpdate({ maintenance_paid: true })}
              >
                Mark Maintenance Paid
              </MenuItem>

              {hasPenalty && (
                <>
                  <MenuItem
                    disabled={isPending}
                    onClick={() => handleUpdate({ penalty_paid: true })}
                  >
                    Mark Penalty Paid
                  </MenuItem>
                  <MenuItem
                    disabled={isPending}
                    onClick={() =>
                      handleUpdate({
                        maintenance_paid: true,
                        penalty_paid: true,
                      })
                    }
                  >
                    Mark Both Paid
                  </MenuItem>
                </>
              )}
            </Menu>

            {/* Dialog for Record View */}
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
                      <Typography variant="subtitle2" gutterBottom>
                        Flat Details
                      </Typography>
                      <Typography variant="body2">
                        <strong>Society:</strong> {recordDetails.society_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Building:</strong> {recordDetails.building_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Flat:</strong> {recordDetails.flat_number}
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
                      <Typography variant="subtitle2" gutterBottom>
                        Charges
                      </Typography>
                      <Typography variant="body2">
                        <strong>Maintenance:</strong> ₹
                        {recordDetails.maintenance_amount}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Penalty:</strong> ₹
                        {recordDetails.penalty_amount}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total Due: ₹{recordDetails.total_due}
                      </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Payment Status
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2">
                          Maintenance Paid:
                        </Typography>
                        <Chip
                          label={recordDetails.maintenance_paid ? "Yes" : "No"}
                          color={
                            recordDetails.maintenance_paid ? "success" : "error"
                          }
                          size="small"
                        />
                      </Stack>
                      {recordDetails.maintenance_paid_at && (
                        <Typography variant="caption" display="block" mt={0.5}>
                          {dayjs(recordDetails.maintenance_paid_at).format(
                            "YYYY-MM-DD HH:mm"
                          )}
                        </Typography>
                      )}

                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        mt={1}
                      >
                        <Typography variant="body2">Penalty Paid:</Typography>
                        <Chip
                          label={recordDetails.penalty_paid ? "Yes" : "No"}
                          color={
                            recordDetails.penalty_paid ? "success" : "error"
                          }
                          size="small"
                        />
                      </Stack>
                      {recordDetails.penalty_paid_at && (
                        <Typography variant="caption" display="block" mt={0.5}>
                          {dayjs(recordDetails.penalty_paid_at).format(
                            "YYYY-MM-DD HH:mm"
                          )}
                        </Typography>
                      )}
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Action Info
                      </Typography>
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
      },
    },
  ];

  return (
    <Box height="calc(100vh - 180px)">
      <MuiBox mb={2} display="flex" justifyContent="flex-start">
        <FormControl size="small">
          <InputLabel id="month-select-label">Month</InputLabel>
          <Select
            labelId="month-select-label"
            value={selectedMonth}
            label="Month"
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map((month: string) => (
              <MenuItem key={month} value={month}>
                {dayjs(month).format("YYYY-MM")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </MuiBox>

      <CommonDataGrid
        rows={MemberMonthlyDues}
        columns={columns}
        loading={loadingMemberMonthlyDues}
        height="calc(100vh - 180px)"
        pageSize={20}
      />
    </Box>
  );
}
