'use client';
import {
    Apartment,
    Campaign,
    Chat,
    Dashboard,
    Event,
    Face,
    Home,
    House,
    Payment,
    People,
    Receipt,
    Settings,
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Societies', icon: <Home />, path: '/societies' },
  { label: 'Buildings', icon: <Apartment />, path: '/buildings' },
  { label: 'Flats', icon: <People />, path: '/flats' },
  { label: 'Add Member', icon: <Face />, path: '/add-member' },
  { label: 'Assign Flat', icon: <House />, path: '/assign-flats' },
  { label: 'Members', icon: <Face />, path: '/members' },
  { label: 'Bills', icon: <Receipt />, path: '/bills' },
  { label: 'Payments', icon: <Payment />, path: '/payments' },
  { label: 'Complaints', icon: <Chat />, path: '/complaints' },
  { label: 'Notices', icon: <Campaign />, path: '/notices' },
  { label: 'Events', icon: <Event />, path: '/events' },
  { label: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box width="240px" bgcolor="white" boxShadow={1} p={2} display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" gap={1} mb={4}>
        <Avatar sx={{ bgcolor: '#1e1ee4' }}>
          <Apartment />
        </Avatar>
        <Typography fontWeight="bold">SocietyManager</Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <Link key={item.path} href={item.path} passHref>
            <ListItem
              sx={{
                mb: 1,
                borderRadius: 2,
                bgcolor: pathname === item.path ? '#1e1ee4' : 'transparent',
                color: pathname === item.path ? 'white' : 'inherit',
                '&:hover': { bgcolor: '#1e1ee4', color: 'white' },
              }}
            >
              <ListItemIcon sx={{ color: pathname === item.path ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );
}
