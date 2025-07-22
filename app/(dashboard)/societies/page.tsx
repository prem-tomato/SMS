"use client";

import CommonButton from "@/components/common/CommonButton";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import {
  createSociety,
  fetchSocieties,
  setEndDateFunc,
} from "@/services/societies";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { z } from "zod";

// Country Dropdown Options
const COUNTRIES = flags.data
  .map((c) => ({
    value: c.name,
    label: `${c.emoji} ${c.name}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const schema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function SocietiesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | null>(
    null
  );
  const [endDateDialogOpen, setEndDateDialogOpen] = useState(false);
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
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
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "India" },
  });

  const { mutateAsync: createMutation } = useMutation({
    mutationFn: createSociety,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["societies"] });
      setOpen(false);
      reset();
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

  const columns = [
    { field: "name", headerName: "Society", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "country", headerName: "Country", flex: 1 },
    {
      field: "end_date",
      headerName: "End Date",
      flex: 1,
      renderCell: ({ row }: any) =>
        row.end_date ? dayjs(row.end_date).format("YYYY-MMMM-DD") : "Set Date",
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

  return (
    <Container maxWidth="xl">
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
          Set End Date
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

      {/* Add Society Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Add New Society
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the society details below
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
            {["name", "address", "city", "state"].map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholder={`Enter ${field}`}
                {...register(field as keyof FormData)}
                error={!!errors[field as keyof FormData]}
                helperText={errors[field as keyof FormData]?.message}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            ))}

            {/* Country Dropdown */}
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
                  <Select {...field} label="Country">
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
              Save Society
            </CommonButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
