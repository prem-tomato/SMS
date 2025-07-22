"use client";

import CommonButton from "@/components/common/CommonButton";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { createSociety, fetchSocieties } from "@/services/societies";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import flags from "emoji-flags";

// ✅ All countries with flags
const COUNTRIES = flags.data
  .map((country) => ({
    value: country.name,
    label: `${country.emoji} ${country.name}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const schema = z.object({
  name: z.string().min(1, "Society name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
});

type FormData = z.infer<typeof schema>;

export default function SocietiesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

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
    defaultValues: {
      country: "India",
    },
  });

  const { mutateAsync: createMutation } = useMutation({
    mutationFn: createSociety,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["societies"] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = async (data: FormData) => {
    await createMutation(data);
  };

  const filteredSocieties = useMemo(() => {
    return societies.filter(
      (s: any) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.state.toLowerCase().includes(search.toLowerCase()) ||
        s.country.toLowerCase().includes(search.toLowerCase())
    );
  }, [societies, search]);

  const columns = useMemo(
    () => [
      { field: "name", headerName: "Society Name", flex: 1, minWidth: 200 },
      { field: "address", headerName: "Address", flex: 1.5, minWidth: 250 },
      { field: "city", headerName: "City", flex: 1, minWidth: 150 },
      { field: "state", headerName: "State", flex: 1, minWidth: 150 },
      { field: "country", headerName: "Country", flex: 1, minWidth: 150 },
    ],
    []
  );

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ textTransform: "none", px: 2, py: 0.8, borderRadius: 2 }}
        >
          Add Society
        </Button>
      </Box>

      <CommonDataGrid rows={filteredSocieties} columns={columns} loading={isLoading} />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Add New Society</Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the society details below
          </Typography>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}>
            {[
              { field: "name", label: "Society Name", placeholder: "e.g., ABC Complex" },
              { field: "address", label: "Address", placeholder: "e.g., 123 Main Street" },
              { field: "city", label: "City", placeholder: "e.g., Mumbai" },
              { field: "state", label: "State", placeholder: "e.g., Maharashtra" },
            ].map(({ field, label, placeholder }) => (
              <TextField
                key={field}
                label={label}
                placeholder={placeholder}
                {...register(field as keyof FormData)}
                error={!!errors[field as keyof FormData]}
                helperText={errors[field as keyof FormData]?.message}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            ))}

            <FormControl fullWidth error={!!errors.country} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
              <InputLabel id="country-label">Country</InputLabel>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="country-label"
                    label="Country"
                    {...field}
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 300 } },
                    }}
                  >
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country.value} value={country.value}>
                        {country.label}
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
            <Button onClick={handleClose} disabled={isSubmitting} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <CommonButton type="submit" variant="contained" loading={isSubmitting} sx={{ bgcolor: "#1e1ee4" }}>
              Save Building
            </CommonButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
