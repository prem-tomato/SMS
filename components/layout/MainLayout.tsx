'use client';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flexGrow={1} display="flex" flexDirection="column">
        <Topbar />
        <Box component="main" flexGrow={1} bgcolor="#f8f9fb" p={2} overflow="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
