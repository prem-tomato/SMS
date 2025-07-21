'use client';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNotice } from '@/services/notices';

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  content: z.string().min(1, 'Content required'),
});
type FormValues = z.infer<typeof schema>;

export default function AddNoticeModal({
  open, onClose, societyId
}: {
  open: boolean;
  onClose: () => void;
  societyId: string;
}) {
  const qc = useQueryClient();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => createNotice(societyId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notices', societyId] });
      reset();
      onClose();
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => mutation.mutate(data);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Notice</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Controller name="title" control={control} render={({ field }) => (
            <TextField
              {...field} label="Title" fullWidth
              error={!!errors.title} helperText={errors.title?.message}
            />
          )}/>
          <Controller name="content" control={control} render={({ field }) => (
            <TextField
              {...field} label="Content" fullWidth multiline rows={4}
              error={!!errors.content} helperText={errors.content?.message}
            />
          )}/>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
