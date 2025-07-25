import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" height="100vh" width="100vw" overflow="hidden">
      <Sidebar />

      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        minWidth={0}
        overflow="hidden"
      >
        <Topbar />
        <Box
          component="main"
          flexGrow={1}
          overflow="auto"
          p={3}
          sx={{ bgcolor: "#f8f9fb" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
