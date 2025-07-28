"use client";

import { getUserRole } from "@/lib/auth";
import {
  ApartmentOutlined,
  CampaignOutlined,
  DashboardOutlined,
  FaceOutlined,
  HouseOutlined,
  LoginOutlined,
  Money,
  PeopleOutlined,
} from "@mui/icons-material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userRole = await getUserRole();
        setRole(userRole);
      } catch (error) {
        console.error("Failed to get user role:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, []);

  // Show loading skeleton while fetching role
  if (isLoading) {
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
          <Skeleton variant="rectangular" width={32} height={32} />
          <Skeleton variant="text" width={140} height={24} />
        </Box>
        <List sx={{ flex: 1 }}>
          {Array.from({ length: 9 }).map((_, index) => (
            <ListItem key={index} sx={{ mb: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Skeleton variant="circular" width={24} height={24} />
              </ListItemIcon>
              <ListItemText>
                <Skeleton variant="text" width={80} />
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }

  // Don't render if no role (user not authenticated)
  if (role === null) return null;

  const navItems = [
    { label: "Dashboard", icon: <DashboardOutlined />, path: "/dashboard" },
    ...(role === "super_admin"
      ? [
          {
            label: "Societies",
            icon: <AccountBalanceOutlinedIcon />,
            path: "/societies",
          },
          {
            label: "Buildings",
            icon: <ApartmentOutlined />,
            path: "/buildings",
          },
          { label: "Flats", icon: <PeopleOutlined />, path: "/flats" },
          { label: "Add Member", icon: <FaceOutlined />, path: "/add-member" },
          {
            label: "Assign Flat",
            icon: <HouseOutlined />,
            path: "/assign-flats",
          },
          { label: "Notices", icon: <CampaignOutlined />, path: "/notices" },
          {
            label: "Expense Tracking",
            icon: <AccountBalanceOutlinedIcon />,
            path: "/expense-tracking",
          },
          {
            label: "Login History",
            icon: <LoginOutlined />,
            path: "/login-history",
          },
          {
            label: "Dues",
            icon: <Money />,
            path: "/member-monthly-dues",
          },
        ]
      : role === "admin"
      ? [
          {
            label: "Buildings",
            icon: <ApartmentOutlined />,
            path: "/buildings",
          },
          { label: "Flats", icon: <PeopleOutlined />, path: "/flats" },
          { label: "Add Member", icon: <FaceOutlined />, path: "/add-member" },
          {
            label: "Assign Flat",
            icon: <HouseOutlined />,
            path: "/assign-flats",
          },
          { label: "Notices", icon: <CampaignOutlined />, path: "/notices" },
          {
            label: "Expense Tracking",
            icon: <AccountBalanceOutlinedIcon />,
            path: "/expense-tracking",
          },
          {
            label: "Login History",
            icon: <LoginOutlined />,
            path: "/login-history",
          },
          {
            label: "Dues",
            icon: <Money />,
            path: "/member-monthly-dues",
          },
        ]
      : []),
  ];

  return (
    <Box
      component="aside"
      sx={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        bgcolor: "white",
        boxShadow: 1,
        p: 2,
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      {/* Header */}
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
          <ApartmentOutlined sx={{ color: "white", fontSize: 20 }} />
        </Box>
        <Typography
          variant="h6"
          component="h1"
          fontWeight="bold"
          fontSize="18px"
          color="#333"
        >
          SocietyManager
        </Typography>
      </Box>

      {/* Navigation List */}
      <List
        component="ul"
        sx={{ flex: 1, p: 0 }}
        role="list"
        aria-label="Navigation menu"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <ListItem
              key={item.path}
              component="li"
              disablePadding
              sx={{ mb: 0.5 }}
            >
              <Link
                href={item.path}
                style={{
                  textDecoration: "none",
                  width: "100%",
                  display: "block",
                }}
                passHref
              >
                <ListItemButton
                  component="a"
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  sx={{
                    borderRadius: 1,
                    border: isActive
                      ? "2px solid #1e1ee4"
                      : "1px solid #e0e0e0",
                    bgcolor: isActive ? "white" : "transparent",
                    color: "black",
                    minHeight: 48,
                    mb: 1,
                    "&:hover": {
                      borderColor: "#1e1ee4",
                      bgcolor: isActive ? "white" : "rgba(30, 30, 228, 0.04)",
                    },
                    "&:focus-visible": {
                      outline: "2px solid #1e1ee4",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "#1e1ee4",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "12px",
                      fontWeight: isActive ? 700 : 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
