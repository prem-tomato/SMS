"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import { createSociety, fetchSocieties } from "@/services/societies";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
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
  InputAdornment,
  Paper,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
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
    return societies.filter((s: any) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.state.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
    );
  }, [societies, search]);

  // MUI DataGrid column definitions
  const columns = useMemo(
    () => [
      { 
        field: "name", 
        headerName: "Society Name", 
        flex: 1,
        minWidth: 200,
      },
      { 
        field: "address", 
        headerName: "Address", 
        flex: 1.5,
        minWidth: 250,
      },
      { 
        field: "city", 
        headerName: "City", 
        flex: 1,
        minWidth: 150,
      },
      { 
        field: "state", 
        headerName: "State", 
        flex: 1,
        minWidth: 150,
      },
      { 
        field: "country", 
        headerName: "Country", 
        flex: 1,
        minWidth: 150,
      },
    ],
    []
  );

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ 
            textTransform: "none", 
            fontWeight: "bold", 
            px: 2,
            py: 0.8,
            borderRadius: 2,
          }}
        >
          Add Society
        </Button>
      </Box>

      {/* Enhanced DataGrid with better pagination */}
        <CommonDataGrid
          rows={filteredSocieties}
          columns={columns}
          loading={isLoading}
        />

      {/* Add Society Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Add New Society
          </Typography>
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
              { field: "country", label: "Country", placeholder: "e.g., India" },
            ].map(({ field, label, placeholder }) => (
              <TextField
                key={field}
                label={label}
                placeholder={placeholder}
                {...register(field as keyof FormData)}
                error={!!errors[field as keyof FormData]}
                helperText={errors[field as keyof FormData]?.message}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            ))}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setOpen(false)} 
              disabled={isSubmitting}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              sx={{ 
                textTransform: "none",
                bgcolor: "#1e1ee4",
                px: 3,
              }}
            >
              {isSubmitting ? "Saving..." : "Save Society"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}