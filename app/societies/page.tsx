'use client';

import { createSociety, fetchSocieties } from '@/services/societies';
import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function SocietiesPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: societies = [], isLoading } = useQuery({
    queryKey: ['societies'],
    queryFn: fetchSocieties,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createMutation } = useMutation({
    mutationFn: createSociety,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societies'] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = async (data: FormData) => {
    await createMutation(data);
  };

  const filteredSocieties = societies.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Societies</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage all societies in your network
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 'bold', bgcolor: '#1e1ee4' }}
        >
          Add Society
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search societies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
        {filteredSocieties.map((society: any) => (
          <ListItem key={society.id} divider>
            <ListItemIcon>
              <ApartmentIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography fontWeight="bold">{society.name}</Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {society.address}, {society.city}, {society.state}, {society.country}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created At: {society.created_at ? new Date(society.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </>
              }
            />
            <Chip label="Active" size="small" sx={{ ml: 2 }} />
          </ListItem>
        ))}
        {!isLoading && filteredSocieties.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ p: 3 }}>
            No societies found.
          </Typography>
        )}
      </List>

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Society</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['name', 'address', 'city', 'state', 'country'].map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                {...register(field as keyof FormData)}
                error={!!errors[field as keyof FormData]}
                helperText={errors[field as keyof FormData]?.message}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
