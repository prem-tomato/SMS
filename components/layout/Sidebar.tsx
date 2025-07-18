"use client";
import {
  Apartment,
  Dashboard,
  ExitToApp,
  Face,
  House,
  People,
} from "@mui/icons-material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
const navItems = [
  { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { label: "Societies", icon: <AccountBalanceIcon />, path: "/societies" },
  { label: "Buildings", icon: <Apartment />, path: "/buildings" },
  { label: "Flats", icon: <People />, path: "/flats" },
  { label: "Add Member", icon: <Face />, path: "/add-member" },
  { label: "Assign Flat", icon: <House />, path: "/assign-flats" },

  // { label: 'Members', icon: <Face />, path: '/members' },
  // { label: 'Bills', icon: <Receipt />, path: '/bills' },
  // { label: 'Payments', icon: <Payment />, path: '/payments' },
  // { label: 'Complaints', icon: <Chat />, path: '/complaints' },
  // { label: 'Notices', icon: <Campaign />, path: '/notices' },
  // { label: 'Events', icon: <Event />, path: '/events' },
  // { label: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem("access_token");
    // Redirect to login
    router.push("/auth/login");
  };

  return (
    <Box
      width="240px"
      bgcolor="white"
      boxShadow={1}
      p={2}
      display="flex"
      flexDirection="column"
      height="100vh"
    >
      {/* Logo Section */}
      <Box display="flex" alignItems="center" gap={1} mb={4}>
        <Box
          sx={{
            bgcolor: "#3f51b5",
            borderRadius: 1,
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Apartment sx={{ color: "white", fontSize: 20 }} />
        </Box>
        <Typography fontWeight="bold" fontSize="18px" color="#333">
          SocietyManager
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            passHref
            style={{ textDecoration: "none" }}
          >
            <ListItem
              sx={{
                mb: 0.5,
                borderRadius: 2,
                bgcolor: pathname === item.path ? "#3f51b5" : "transparent",
                color: pathname === item.path ? "white" : "#666",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: pathname === item.path ? "#3f51b5" : "#f5f5f5",
                  color: pathname === item.path ? "white" : "#333",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.path ? "white" : "#666",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "14px",
                  fontWeight: pathname === item.path ? 600 : 400,
                }}
              />
            </ListItem>
          </Link>
        ))}
      </List>

      {/* Logout Section */}
      <Box>
        <Divider sx={{ mb: 2 }} />
        <ListItem
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: "#666",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "#f5f5f5",
              color: "#333",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#666", minWidth: 40 }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: "14px" }}
          />
        </ListItem>
      </Box>
    </Box>
  );
}
