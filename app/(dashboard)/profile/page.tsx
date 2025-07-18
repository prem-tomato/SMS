'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/services/auth';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography color="error">
          {(error as Error).message || 'Something went wrong.'}
        </Typography>
        <Button variant="contained" onClick={() => router.refresh()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Typography><strong>Name:</strong> {user.first_name} {user.last_name}</Typography>
        <Typography><strong>Role:</strong> {user.role}</Typography>
        <Typography><strong>Login Key:</strong> {user.login_key}</Typography>
        <Typography><strong>Phone:</strong> {user.phone}</Typography>
        <Typography>
          <strong>Joined At:</strong>{' '}
          {new Date(user.created_at).toLocaleDateString()}
        </Typography>
      </Paper>
    </Container>
  );
}
