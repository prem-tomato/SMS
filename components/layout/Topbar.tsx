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
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/auth/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    router.push('/profile');
    handleMenuClose();
  };

  if (!user) {
    return (
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          color: 'black',
          borderBottom: '1px solid #e0e0e0',
          height: 64,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: '100%' }}>
          <Box />
          <Typography fontWeight="bold" color="text.secondary">Loading...</Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          color: 'black',
          borderBottom: '1px solid #e0e0e0',
          height: 64,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: '100%' }}>
          <Box />
          
          <Box display="flex" alignItems="center" gap={2}>
            {/* Notification Icon */}
            <IconButton
              size="large"
              sx={{ 
                color: '#666',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Profile Section */}
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1}
              sx={{ 
                cursor: 'pointer',
                borderRadius: 2,
                p: 1,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={handleMenuOpen}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#3f51b5', 
                  width: 32, 
                  height: 32,
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
              </Avatar>
              <Box textAlign="left">
                <Typography variant="body2" fontWeight="600" color="#333">
                  {user.first_name} {user.last_name}
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  color="error"
                  sx={{ 
                    height: 18, 
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Box>
              <KeyboardArrowDownIcon sx={{ color: '#666', fontSize: 16 }} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleProfile}>
          <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ExitToAppIcon sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}