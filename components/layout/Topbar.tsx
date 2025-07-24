"use client";

import {
  getAccessToken,
  removeAccessToken,
  removeSocietyId,
  removeUserRole,
} from "@/lib/auth";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Skeleton,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  first_name: string;
  last_name: string;
  role: string;
};

export default function Topbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        
        if (res.data) {
          setUser(res.data);
          setError(null);
        } else {
          throw new Error("No user data received");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setError("Failed to load user data");
        // Only redirect on auth errors, not network errors
        if (error instanceof Error && error.message.includes("401")) {
          router.push("/auth/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      removeAccessToken();
      removeUserRole();
      removeSocietyId();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      handleMenuClose();
    }
  };

  const handleProfile = () => {
    router.push("/profile");
    handleMenuClose();
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_admin":
        return "error";
      case "admin":
        return "warning";
      default:
        return "primary";
    }
  };

  const formatRole = (role: string) => {
    return role.replace("_", " ").toUpperCase();
  };

  // Loading state
  if (isLoading) {
    return (
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "black",
          borderBottom: "1px solid #e0e0e0",
          height: 64,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", height: "100%" }}>
          <Box />
          <Box display="flex" alignItems="center" gap={1}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="rectangular" width={60} height={18} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="circular" width={16} height={16} />
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "black",
          borderBottom: "1px solid #e0e0e0",
          height: 64,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", height: "100%" }}>
          <Box />
          <Typography variant="body2" color="error" fontWeight="500">
            {error}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  // No user state (shouldn't happen if loading/error states work correctly)
  if (!user) {
    return null;
  }

  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "black",
          borderBottom: "1px solid #e0e0e0",
          height: 64,
        }}
      >
        <Toolbar 
          sx={{ justifyContent: "space-between", height: "100%" }}
          role="banner"
        >
          <Box />

          <Box display="flex" alignItems="center" gap={2}>
            {/* User Profile Section */}
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                p: 1,
                "&:hover": { bgcolor: "#f5f5f5" },
                "&:focus-visible": {
                  outline: "2px solid #1e1ee4",
                  outlineOffset: "2px",
                },
              }}
              onClick={handleMenuOpen}
              role="button"
              tabIndex={0}
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleMenuOpen(e as any);
                }
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#1e1ee4",
                  width: 32,
                  height: 32,
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
                alt={`${user.first_name} ${user.last_name}`}
              >
                {user.first_name.charAt(0).toUpperCase()}
                {user.last_name.charAt(0).toUpperCase()}
              </Avatar>
              <Box textAlign="left">
                <Typography variant="body2" fontWeight="600" color="#333">
                  {user.first_name} {user.last_name}
                </Typography>
                <Chip
                  label={formatRole(user.role)}
                  size="small"
                  color={getRoleColor(user.role)}
                  sx={{
                    height: 18,
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              </Box>
              <KeyboardArrowDownIcon 
                sx={{ 
                  color: "#666", 
                  fontSize: 16,
                  transform: Boolean(anchorEl) ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease-in-out",
                }} 
              />
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
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ 
          mt: 1,
          "& .MuiPaper-root": {
            minWidth: 180,
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          }
        }}
        MenuListProps={{
          role: "menu",
          "aria-label": "User account menu",
        }}
      >
        <MenuItem 
          onClick={handleProfile}
          role="menuitem"
          sx={{
            py: 1.5,
            "&:hover": {
              bgcolor: "#f5f5f5",
            },
            "&:focus-visible": {
              outline: "2px solid #1e1ee4",
              outlineOffset: "-2px",
            },
          }}
        >
          <PersonIcon sx={{ mr: 2, fontSize: 20, color: "#666" }} />
          <Typography variant="body2" fontWeight="500">
            Profile
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem 
          onClick={handleLogout}
          role="menuitem"
          sx={{
            py: 1.5,
            color: "#d32f2f",
            "&:hover": {
              bgcolor: "#ffebee",
            },
            "&:focus-visible": {
              outline: "2px solid #1e1ee4",
              outlineOffset: "-2px",
            },
          }}
        >
          <ExitToAppIcon sx={{ mr: 2, fontSize: 20 }} />
          <Typography variant="body2" fontWeight="500">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}