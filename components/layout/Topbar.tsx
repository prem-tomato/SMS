'use client';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

type User = {
  first_name: string;
  last_name: string;
  role: string;
};


export default function Topbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setUser(res.data);
        }
      })
      .catch(() => router.push('/auth/login'));
  }, [router]);

  if (!user) {
    return (
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          color: 'black',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box />
          <Typography fontWeight="bold" color="text.secondary">Loading...</Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'white',
        color: 'black',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box />
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton>
            <Badge variant="dot" color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Avatar sx={{ bgcolor: '#1e1ee4' }}>
            {user.first_name.charAt(0).toUpperCase()}
          </Avatar>
          <Box textAlign="right">
            <Typography variant="body2" fontWeight="bold">
              {user.first_name} {user.last_name}
            </Typography>
            <Chip
              label={user.role}
              size="small"
              color="error"
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
