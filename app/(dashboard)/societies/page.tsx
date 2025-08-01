"use client";

import CommonButton from "@/components/common/CommonButton";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { societyType } from "@/db/utils/enums/enum";
import { getUserRole } from "@/lib/auth";
import {
  createSociety,
  deleteSociety,
  fetchSocieties,
  setEndDateFunc,
  softDeleteSociety,
} from "@/services/societies";
import { createUser } from "@/services/user";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import flags from "emoji-flags";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast, ToastContainer } from "react-toastify";
import { z } from "zod";

// Country Dropdown Options
const COUNTRIES = flags.data
  .map((c) => ({
    value: c.name,
    label: `${c.emoji} ${c.name}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// Input schema for form validation (all strings as they come from form inputs)
const inputSchema = z.object({
  // Society fields
  name: z.string().min(1, "Society name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  opening_balance: z
    .string()
    .min(1, "Opening balance is required")
    .regex(/^\d*\.?\d*$/, "Opening balance must be a valid number"),

  // Admin user fields
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  login_key: z
    .string()
    .max(6, "Login key must be 6 digits")
    .regex(/^\d+$/, "Login key must be a number"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((phone) => isValidPhoneNumber(phone), {
      message: "Please enter a valid phone number",
    }),
  society_type: z.enum(societyType),
});

// Output schema with transformed types
const outputSchema = inputSchema.extend({
  login_key: z
    .string()
    .max(6, "Login key must be 6 digits")
    .regex(/^\d+$/, "Login key must be a number")
    .transform((val) => parseInt(val, 10)),
  opening_balance: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 1000000) {
      throw new Error(
        "Opening balance must be a valid number between 0 and 1,000,000"
      );
    }
    return num;
  }),
});

type FormInputData = z.infer<typeof inputSchema>;

export default function SocietiesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | null>(
    null
  );
  const [endDateDialogOpen, setEndDateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = getUserRole();
    setRole(storedRole);
  }, []);

  const { data: societies = [], isLoading } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocieties,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInputData>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      country: "India",
      opening_balance: "0",
      society_type: undefined,
    },
  });

  const { mutateAsync: createMutation } = useMutation({
    mutationFn: async (inputData: FormInputData) => {
      let createdSociety = null;

      try {
        // Transform and validate the input data
        const data = outputSchema.parse(inputData);

        // First create the society (including opening_balance)
        const societyData = {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          opening_balance: data.opening_balance, // Fixed: Include opening_balance
          society_type: data.society_type,
        };

        createdSociety = await createSociety(societyData);

        // Then create the admin user for this society
        const adminData = {
          role: "admin" as const,
          first_name: data.first_name,
          last_name: data.last_name,
          login_key: data.login_key as any, // Temporary fix - API expects number but types show string
          phone: data.phone,
        };

        await createUser(createdSociety.id, adminData);

        return createdSociety;
      } catch (error: any) {
        if (createdSociety?.id) {
          try {
            await deleteSociety(createdSociety.id);
            console.log(
              `Rolled back society creation with ID: ${createdSociety.id}`
            );
          } catch (rollbackError) {
            console.error(
              "Failed to rollback society creation:",
              rollbackError
            );
          }
        }

        // Login key already exists error
        const message =
          error?.response?.data?.message?.toLowerCase() ||
          error?.message?.toLowerCase() ||
          "";

        if (message.includes("login key")) {
          setError("login_key", {
            type: "manual",
            message:
              "Login key already exists. Please use a different login key.",
          });

          toast.error(
            "Login key already exists. Please use a different login key."
          );
        } else if (message.includes("phone")) {
          setError("phone", {
            type: "manual",
            message: "Phone number already exists or is invalid.",
          });
        }
        throw error;
      }
    },
    onSuccess: (createdSociety) => {
      queryClient.invalidateQueries({ queryKey: ["societies"] });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      console.error("Society/Admin creation failed:", error);
    },
  });

  const { mutateAsync: endDateMutation, isPending: isEndDateUpdating } =
    useMutation({
      mutationFn: ({ id, end_date }: { id: string; end_date: string }) =>
        setEndDateFunc({ id, end_date }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["societies"] });
        setEndDateDialogOpen(false);
        setMenuAnchor(null);
        setSelectedSocietyId(null);
      },
      onError: (error: any) => {
        console.error("Failed to update end date:", error);
        toast.error("Failed to update end date. Please try again.");
      },
    });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: (societyId: string) => softDeleteSociety(societyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["societies"] });
      setDeleteDialogOpen(false);
      setMenuAnchor(null);
      setSelectedSocietyId(null);
      toast.success("Society deleted successfully");
    },
    onError: (error: any) => {
      console.error("Failed to delete society:", error);
      toast.error("Society already in use.");
    },
  });

  const filteredSocieties = useMemo(
    () =>
      societies.filter(
        (s: any) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.city.toLowerCase().includes(search.toLowerCase())
      ),
    [societies, search]
  );

  const selectedSociety = societies.find((s) => s.id === selectedSocietyId);

  const columns = [
    { field: "name", headerName: "Society", flex: 1 },
    { field: "society_type", headerName: "Type", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    {
      field: "end_date",
      headerName: "End Date",
      flex: 1,
      renderCell: ({ row }: any) =>
        row.end_date ? dayjs(row.end_date).format("YYYY-MMMM-DD") : "Set Date",
    },
    {
      field: "opening_balance",
      headerName: "Opening Balance",
      flex: 1,
      renderCell: ({ row }: any) => {
        const value = Number(row.opening_balance) || 0;
        return value.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      },
    },
    {
      field: "is_active",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => {
        const isActive = params.value;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.875rem",
              color: isActive ? "#10b981" : "#ef4444",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: isActive ? "#10b981" : "#ef4444",
                transition: "background-color 0.2s",
              }}
            />
            <span>{isActive ? "Active" : "Inactive"}</span>
          </div>
        );
      },
    },
    ...(role === "super_admin"
      ? [
          {
            field: "actions",
            headerName: "Actions",
            renderCell: ({ row }: any) => (
              <IconButton
                onClick={(e) => {
                  setMenuAnchor(e.currentTarget);
                  setSelectedSocietyId(row.id);
                }}
              >
                <MoreVertIcon />
              </IconButton>
            ),
          },
        ]
      : []),
  ];

  const handleEndDateSubmit = async () => {
    if (!selectedSocietyId) return;
    await endDateMutation({ id: selectedSocietyId, end_date: endDate });
  };

  const handleDeleteSociety = async () => {
    if (!selectedSocietyId) return;
    await deleteMutation(selectedSocietyId);
  };

  return (
    <>
      <Box height="calc(100vh - 180px)">
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: 1,
              border: "1px solid #1e1ee4",
              color: "#1e1ee4",
            }}
          >
            Add Society
          </Button>
        </Box>

        <CommonDataGrid
          rows={filteredSocieties}
          columns={columns}
          loading={isLoading}
          height="calc(100vh - 180px)" // Adjust based on header/toolbar height
          pageSize={20}
        />

        {/* Three Dot Menu */}
        <Menu
          open={Boolean(menuAnchor)}
          anchorEl={menuAnchor}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setEndDateDialogOpen(true);
              setMenuAnchor(null);
            }}
          >
            {societies.find((s) => s.id === selectedSocietyId)?.end_date
              ? "Update End Date"
              : "Set End Date"}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
              setMenuAnchor(null);
            }}
            sx={{ color: "#ef4444" }}
          >
            Delete Society
          </MenuItem>
        </Menu>

        {/* End Date Dialog */}
        <Dialog
          open={endDateDialogOpen}
          onClose={() => setEndDateDialogOpen(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>Set End Date</DialogTitle>

          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: dayjs().format("YYYY-MM-DD"),
              }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button
              onClick={() => setEndDateDialogOpen(false)}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <CommonButton
              variant="contained"
              loading={isEndDateUpdating}
              disabled={dayjs(endDate).isBefore(dayjs(), "day")}
              onClick={handleEndDateSubmit}
              sx={{ textTransform: "none", bgcolor: "#1e1ee4" }}
            >
              Update
            </CommonButton>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon sx={{ color: "#ef4444" }} />
            <Typography variant="h6" fontWeight="bold">
              Delete Society
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body1">
              Are you sure you want to delete the society{" "}
              <strong>"{selectedSociety?.name}"</strong>?
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <CommonButton
              variant="contained"
              loading={isDeleting}
              onClick={handleDeleteSociety}
              sx={{
                textTransform: "none",
                bgcolor: "#ef4444",
                "&:hover": { bgcolor: "#dc2626" },
              }}
            >
              Delete Society
            </CommonButton>
          </DialogActions>
        </Dialog>

        {/* Add Society Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Add New Society & Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the society details and admin user information below
            </Typography>
          </DialogTitle>

          <Box
            component="form"
            onSubmit={handleSubmit((data) => createMutation(data))}
          >
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                pb: 2,
              }}
            >
              {/* Society Information Section */}
              <Typography variant="subtitle1" fontWeight="bold" color="#1e1ee4">
                Society Information
              </Typography>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Society Name"
                  placeholder="Enter society name"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />

                <TextField
                  label="Address"
                  placeholder="Enter address"
                  {...register("address")}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
              </Box>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="City"
                  placeholder="Enter city"
                  {...register("city")}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />

                <TextField
                  label="State"
                  placeholder="Enter state"
                  {...register("state")}
                  error={!!errors.state}
                  helperText={errors.state?.message}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
              </Box>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Opening Balance"
                  placeholder="Enter opening balance"
                  type="number"
                  {...register("opening_balance")}
                  error={!!errors.opening_balance}
                  helperText={errors.opening_balance?.message}
                  fullWidth
                  inputProps={{
                    min: 0,
                    max: 1000000,
                    step: 0.01,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />

                <FormControl
                  fullWidth
                  error={!!errors.country}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                >
                  <InputLabel>Country</InputLabel>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Country"
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              "& .MuiMenuItem-root": {
                                fontSize: "0.875rem",
                              },
                            },
                          },
                        }}
                      >
                        {COUNTRIES.map((c) => (
                          <MenuItem key={c.value} value={c.value}>
                            {c.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.country && (
                    <FormHelperText>{errors.country.message}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <FormControl
                fullWidth
                error={!!errors.society_type}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                <InputLabel>Society Type</InputLabel>
                <Controller
                  name="society_type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Society Type">
                      {Object.entries(societyType).map(([key, value]) => (
                        <MenuItem key={key} value={value}>
                          {value.charAt(0).toUpperCase() +
                            value.slice(1).replace(/_/g, " ")}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.society_type && (
                  <FormHelperText>{errors.society_type.message}</FormHelperText>
                )}
              </FormControl>

              <Divider />

              {/* Admin User Information Section */}
              <Typography variant="subtitle1" fontWeight="bold" color="#1e1ee4">
                Admin User Information
              </Typography>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="First Name"
                  placeholder="Enter first name"
                  {...register("first_name")}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />

                <TextField
                  label="Last Name"
                  placeholder="Enter last name"
                  {...register("last_name")}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
              </Box>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Login Key"
                  placeholder="Enter 6-digit login key"
                  {...register("login_key")}
                  error={!!errors.login_key}
                  helperText={errors.login_key?.message}
                  fullWidth
                  type="text"
                  inputMode="numeric"
                  inputProps={{
                    maxLength: 6,
                    pattern: "[0-9]*",
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
                {/* Phone Input with react-phone-number-input */}
                <Box>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <PhoneInput
                          {...field}
                          placeholder="Enter phone number"
                          defaultCountry="IN"
                          international
                          countryCallingCodeEditable={false}
                          className="phone-input"
                        />
                        {errors.phone && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#d32f2f",
                              mt: 0.5,
                              ml: 1.75,
                              display: "block",
                            }}
                          >
                            {errors.phone.message}
                          </Typography>
                        )}
                      </Box>
                    )}
                  />
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <CommonButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{ bgcolor: "#1e1ee4" }}
              >
                Save Society & Admin
              </CommonButton>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
