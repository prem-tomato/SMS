"use client";

import { getUserRole } from "@/lib/auth";
import {
  Apartment,
  Campaign,
  Dashboard,
  Face,
  House,
  People,
} from "@mui/icons-material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = getUserRole();
    setRole(userRole);
  }, []);

  if (role === null) return null;

  const navItems = [
    { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    ...(role === "super_admin"
      ? [
          {
            label: "Societies",
            icon: <AccountBalanceIcon />,
            path: "/societies",
          },
          { label: "Buildings", icon: <Apartment />, path: "/buildings" },
          { label: "Flats", icon: <People />, path: "/flats" },
          { label: "Add Member", icon: <Face />, path: "/add-member" },
          { label: "Assign Flat", icon: <House />, path: "/assign-flats" },
          { label: "Notices", icon: <Campaign />, path: "/notices" },
        ]
      : role === "admin"
      ? [
          { label: "Buildings", icon: <Apartment />, path: "/buildings" },
          { label: "Flats", icon: <People />, path: "/flats" },
          { label: "Add Member", icon: <Face />, path: "/add-member" },
          { label: "Assign Flat", icon: <House />, path: "/assign-flats" },
          { label: "Notices", icon: <Campaign />, path: "/notices" },
        ]
      : []),
  ];

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
      <Box display="flex" alignItems="center" gap={1} mb={4}>
        <Box
          sx={{
            bgcolor: "#1e1ee4",
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

      <List sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            style={{ textDecoration: "none" }}
          >
            <ListItem
              sx={{
                mb: 0.5,
                borderRadius: 2,
                bgcolor: pathname === item.path ? "#1e1ee4" : "transparent",
                color: pathname === item.path ? "white" : "#666",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: pathname === item.path ? "#1e1ee4" : "#f5f5f5",
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
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );
}
