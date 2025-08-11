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
import PaymentIcon from "@mui/icons-material/Payment";
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
  const [openDues, setOpenDues] = useState(false);
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

  // Create admin items based on society type
  const getAdminItems = () => {
    const items = [];

    // Only show Buildings and Flats if society type is NOT housing
    if (societyType !== "housing") {
      items.push({
        label: "Buildings",
        icon: <ApartmentOutlined />,
        path: "/buildings",
      });

      items.push({
        label: societyType === "commercial" ? "Shops" : "Flats",
        icon: <PeopleOutlined />,
        path: "/flats",
      });
    }

    // Show Housing Units only if society type is housing
    if (societyType === "housing") {
      items.push({
        label: "Housing Units",
        icon: <HouseOutlined />,
        path: "/housing-units",
      });
    }

    // Add member and assign items
    items.push({
      label:
        societyType === "commercial"
          ? "Add Shop Owner"
          : societyType === "housing"
          ? "Add Resident"
          : "Add Resident",
      icon: <FaceOutlined />,
      path: "/add-member",
    });

    items.push({
      label:
        societyType === "commercial"
          ? "Assign Shop"
          : societyType === "housing"
          ? "Assign Unit"
          : "Assign Flat",
      icon: <HouseOutlined />,
      path: "/assign-flats",
    });

    return items;
  };

  const adminItems = getAdminItems();

  const superAdminDuesItems = [
    {
      label: "Maintenance Dues",
      icon: <MoreHorizIcon />,
      path: "/member-monthly-dues",
    },
  ];

  // Dues items for dropdown
  const duesItems = [
    {
      label: "Maintenance Dues",
      icon: <MoreHorizIcon />,
      path: "/member-monthly-dues",
    },
    {
      label: "Pay Dues",
      icon: <PaymentIcon />,
      path: "/pay-dues",
    },
    {
      label: "Dues Summary",
      icon: <MonetizationOnOutlinedIcon />,
      path: "/dues-summary",
    },
  ];

  // Filter dues items based on role
  const getDuesItemsForRole = () => {
    if (role === "super_admin") {
      return superAdminDuesItems;
    } else if (role === "admin") {
      return duesItems;
    } else if (role === "member") {
      return duesItems.filter((item) => item.path !== "/member-monthly-dues"); // Exclude maintenance dues
    }
    return [];
  };

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
      ? [...commonItems, miscItems[0]] // Only notices for members
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

        {/* Dues Dropdown */}
        <>
          <ListItemButton
            onClick={() => setOpenDues(!openDues)}
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
              <PaymentIcon />
            </ListItemIcon>
            <ListItemText
              primary="Dues Management"
              primaryTypographyProps={{
                fontSize: "12px",
                fontWeight: openDues ? 700 : 500,
                textTransform: "uppercase",
              }}
            />
            {openDues ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openDues} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 3 }}>
              {getDuesItemsForRole().map(renderNavItem)}
            </List>
          </Collapse>
        </>

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
                primary="Finances"
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
