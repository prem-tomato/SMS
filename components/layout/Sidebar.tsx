"use client";

import { getSocietyTypeFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  ApartmentOutlined,
  CampaignOutlined,
  DashboardOutlined,
  ExpandLess,
  ExpandMore,
  FaceOutlined,
  HouseOutlined,
  LoginOutlined,
  PeopleOutlined,
} from "@mui/icons-material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";

import {
  Box,
  Collapse,
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
  const [openMisc, setOpenMisc] = useState(false);
  const [openTransactions, setOpenTransactions] = useState(false);
  const [societyType, setSocietyType] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userRole = await getUserRole();
        const societyType = await getSocietyTypeFromLocalStorage();
        setRole(userRole);
        setSocietyType(societyType);
      } catch (error) {
        console.error("Failed to get user role:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRole();
  }, []);

  if (isLoading) {
    return (
      <Box width="240px" bgcolor="white" boxShadow={1} p={2} height="100vh">
        <Box display="flex" alignItems="center" gap={1} mb={4}>
          <Skeleton variant="rectangular" width={32} height={32} />
          <Skeleton variant="text" width={140} height={24} />
        </Box>
        <List>
          {Array.from({ length: 9 }).map((_, index) => (
            <ListItem key={index}>
              <ListItemIcon>
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

  if (role === null) return null;

  const commonItems = [
    {
      label: "Dashboard",
      icon: <DashboardOutlined />,
      path: "/dashboard",
    },
  ];

  const adminItems = [
    {
      label: "Buildings",
      icon: <ApartmentOutlined />,
      path: "/buildings",
    },
    {
      label: societyType === "commercial" ? "Shops" : "Flats",
      icon: <PeopleOutlined />,
      path: "/flats",
    },
    {
      label: societyType === "commercial" ? "Add Shop Owner" : "Add Member",
      icon: <FaceOutlined />,
      path: "/add-member",
    },
    {
      label: societyType === "commercial" ? "Assign Shop" : "Assign Flat",
      icon: <HouseOutlined />,
      path: "/assign-flats",
    },
    {
      label: "Maintenance Dues",
      icon: <MoreHorizIcon />,
      path: "/member-monthly-dues",
    },
  ];

  const miscItems = [
    {
      label: "Notices",
      icon: <CampaignOutlined />,
      path: "/notices",
    },
    {
      label: "Login History",
      icon: <LoginOutlined />,
      path: "/login-history",
    },
  ];

  const transactionItems = [
    {
      label: "Expense",
      icon: <MoneyOffIcon />,
      path: "/expense-tracking",
    },
    {
      label: "Income",
      icon: <AttachMoneyIcon />,
      path: "/income-tracking",
    },
  ];

  const superAdminExtra = [
    {
      label: "Societies",
      icon: <AccountBalanceOutlinedIcon />,
      path: "/societies",
    },
  ];

  const navItems =
    role === "super_admin"
      ? [...commonItems, ...superAdminExtra, ...adminItems]
      : role === "admin"
      ? [...commonItems, ...adminItems]
      : role === "member"
      ? [...commonItems, miscItems[0]]
      : [];

  const renderNavItem = (item: any) => {
    const isActive = pathname === item.path;
    return (
      <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
        <Link href={item.path} passHref legacyBehavior>
          <ListItemButton
            component="a"
            sx={{
              borderRadius: 1,
              border: isActive ? "2px solid #1e1ee4" : "1px solid #e0e0e0",
              bgcolor: isActive ? "white" : "transparent",
              color: "black",
              mb: 1,
              "&:hover": {
                borderColor: "#1e1ee4",
                bgcolor: isActive ? "white" : "rgba(30, 30, 228, 0.04)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#1e1ee4", minWidth: 40 }}>
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
  };

  return (
    <Box
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
        <Typography variant="h6" fontWeight="bold" fontSize="18px" color="#333">
          SocietyManager
        </Typography>
      </Box>

      {/* Main nav items */}
      <List sx={{ flex: 1 }}>
        {navItems.map(renderNavItem)}
        {/* Transactions Dropdown */}
        {(role === "super_admin" || role === "admin") && (
          <>
            <ListItemButton
              onClick={() => setOpenTransactions(!openTransactions)}
              sx={{
                borderRadius: 1,
                border: "1px solid #e0e0e0",
                mb: 1,
                "&:hover": {
                  borderColor: "#1e1ee4",
                  bgcolor: "rgba(30, 30, 228, 0.04)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#1e1ee4", minWidth: 40 }}>
                <MonetizationOnOutlinedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Transactions"
                primaryTypographyProps={{
                  fontSize: "12px",
                  fontWeight: openTransactions ? 700 : 500,
                  textTransform: "uppercase",
                }}
              />
              {openTransactions ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openTransactions} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 3 }}>
                {transactionItems.map(renderNavItem)}
              </List>
            </Collapse>
          </>
        )}

        {/* Miscellaneous Dropdown */}
        {(role === "super_admin" || role === "admin") && (
          <>
            <ListItemButton
              onClick={() => setOpenMisc(!openMisc)}
              sx={{
                borderRadius: 1,
                border: "1px solid #e0e0e0",
                mb: 1,
                "&:hover": {
                  borderColor: "#1e1ee4",
                  bgcolor: "rgba(30, 30, 228, 0.04)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#1e1ee4", minWidth: 40 }}>
                <StorageOutlinedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Miscellaneous"
                primaryTypographyProps={{
                  fontSize: "12px",
                  fontWeight: openMisc ? 700 : 500,
                  textTransform: "uppercase",
                }}
              />
              {openMisc ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openMisc} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 3 }}>
                {miscItems.map(renderNavItem)}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Box>
  );
}
