"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddUserModal from "@/components/user/AddUserModal";
import { fetchSocietyOptions } from "@/services/societies";
import { fetchUsersBySociety } from "@/services/user";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close"; // ✅ New
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function UsersPage() {
  const [societyId, setSocietyId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true); // ✅ Open by default

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users", societyId],
    queryFn: () => fetchUsersBySociety(societyId),
    enabled: !!societyId,
  });

  // ✅ Define columns for DataGrid
  const columns = useMemo(
    () => [
      { field: "first_name", headerName: "First Name", flex: 1 },
      { field: "last_name", headerName: "Last Name", flex: 1 },
      {
        field: "role",
        headerName: "Role",
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params.value}
            color={params.value === "Admin" ? "primary" : "secondary"}
            size="small"
          />
        ),
      },
      { field: "phone", headerName: "Phone", flex: 1 },
    ],
    []
  );

  return (
    <Container maxWidth="xl">
      {/* ✅ Top Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {societyId && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                textTransform: "none",
                px: 2,
                py: 0.8,
                borderRadius: 2,
                border: "1px solid #1e1ee4", // mimic outlined style
                color: "#1e1ee4",
              }}
              onClick={() => setModalOpen(true)}
            >
              Add Member
            </Button>
          )}
          <IconButton
            sx={{
              p: 1, // padding for better click area
              borderRadius: 2,
              border: "1px solid #1e1ee4", // mimic outlined style
              color: "#1e1ee4",
            }}
            onClick={() => setFilterOpen(true)}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ✅ Users DataGrid */}
      {societyId ? (
        <CommonDataGrid rows={users} columns={columns} loading={loadingUsers} />
      ) : (
        <Typography variant="body1" color="text.secondary">
          Please select a Society from filters ➡️
        </Typography>
      )}

      {/* ✅ Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          {/* ✅ Header with Close Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* ✅ Society Dropdown */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Society</InputLabel>
            <Select
              value={societyId}
              label="Society"
              onChange={(e) => setSocietyId(e.target.value)}
            >
              {loadingSocieties ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                societies.map((s: any) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* ✅ Apply Filters Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => setFilterOpen(false)}
            disabled={!societyId} // ✅ Must select a society
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* ✅ Add User Modal */}
      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        societyId={societyId}
      />
    </Container>
  );
}
