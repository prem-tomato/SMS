import { createFlat } from '@/services/flats';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
  
  // Define the input schema (what the form receives)
  const inputSchema = z.object({
    flat_number: z.string().min(1, 'Flat number is required'),
    floor_number: z.string().min(1, 'Floor number is required'),
  });
  
  // Define the output schema (what gets sent to the API)
  const outputSchema = z.object({
    flat_number: z.string().min(1, 'Flat number is required'),
    floor_number: z.string().transform(val => Number(val)).refine(val => val >= 0, 'Floor must be 0 or above'),
  });
  
  type FormValues = z.infer<typeof inputSchema>;
  type OutputValues = z.infer<typeof outputSchema>;
  
  export default function AddFlatModal({ open, onClose, societyId, buildingId }: {
    open: boolean;
    onClose: () => void;
    societyId: string;
    buildingId: string;
  }) {
    const queryClient = useQueryClient();
  
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
      resolver: zodResolver(inputSchema),
      defaultValues: { flat_number: '', floor_number: '' },
    });
  
    const mutation = useMutation({
      mutationFn: (data: OutputValues) =>
        createFlat(societyId, buildingId, {
          flat_number: data.flat_number,
          floor_number: data.floor_number,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['flats', societyId, buildingId] });
        reset();
        onClose();
      },
    });
  
    const onSubmit = (data: FormValues) => {
      // Transform the data before sending to the API
      const result = outputSchema.safeParse(data);
      if (result.success) {
        mutation.mutate(result.data);
      }
    };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Flat</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="flat_number"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Flat Number" error={!!errors.flat_number} helperText={errors.flat_number?.message} fullWidth />
              )}
            />
            <Controller
              name="floor_number"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Floor Number" type="number" error={!!errors.floor_number} helperText={errors.floor_number?.message} fullWidth />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    );
  }