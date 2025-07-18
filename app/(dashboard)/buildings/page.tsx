'use client';

import { createBuilding, fetchBuildings } from '@/services/building';
import { fetchSocietyOptions } from '@/services/societies';
import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const inputSchema = z.object({
  society_id: z.string().min(1, 'Select society'),
  name: z.string().min(1, 'Building name is required'),
  total_floors: z.string().min(1, 'Total floors is required'),
});

const outputSchema = z.object({
  society_id: z.string().min(1, 'Select society'),
  name: z.string().min(1, 'Building name is required'),
  total_floors: z.string()
    .transform(val => Number(val))
    .refine(val => val > 0, 'At least one floor required'),
});

type FormValues = z.infer<typeof inputSchema>;
type OutputValues = z.infer<typeof outputSchema>;

export default function BuildingsPage() {
  const queryClient = useQueryClient();

  const { data: buildings, isLoading: loadingBuildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
  });

  const { data: societies, isLoading: loadingSocieties } = useQuery({
    queryKey: ['societies'],
    queryFn: fetchSocietyOptions,
  });

  const [open, setOpen] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: { society_id: '', name: '', total_floors: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: OutputValues) =>
      createBuilding(data.society_id, {
        name: data.name,
        total_floors: data.total_floors,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: FormValues) => {
    const result = outputSchema.safeParse(data);
    if (result.success) {
      mutation.mutate(result.data);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Buildings</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Building
        </Button>
      </Box>

      {loadingBuildings ? (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      ) : (
        <List sx={{ bgcolor: 'white', borderRadius: 2 }}>
          {buildings?.map((b: any, i: number) => (
            <ListItem key={i} divider>
              <ListItemIcon><BusinessIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary={<Typography fontWeight="bold">{b.name}</Typography>}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {b.society_name} • {b.total_floors} Floors
                    </Typography>
                    <Chip label={`Action by: ${b.action_by}`} size="small" sx={{ mt: 1 }} />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Add Building Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Building</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                      societies?.map((s: any) => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.society_id && (
                    <Typography color="error" variant="caption">{errors.society_id.message}</Typography>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Building Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="total_floors"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Total Floors"
                  type="number"
                  error={!!errors.total_floors}
                  helperText={errors.total_floors?.message}
                  fullWidth
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ pr: 3, pb: 2 }}>
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