"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddFlatModal from "@/components/flat/FlatModel";
import { fetchBuildingsBySociety } from "@/services/building";
import { fetchFlats } from "@/services/flats";
import { fetchSocietyOptions } from "@/services/societies";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close"; // ✅ NEW
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

export default function FlatsPage() {
  const [societyId, setSocietyId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true); // ✅ Sidebar opens automatically

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
  });

  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ["buildings", societyId],
    queryFn: () => fetchBuildingsBySociety(societyId),
    enabled: !!societyId,
  });

  const { data: flats = [], isLoading: loadingFlats } = useQuery({
    queryKey: ["flats", societyId, buildingId],
    queryFn: () => fetchFlats(societyId, buildingId),
    enabled: !!societyId && !!buildingId,
  });

  const columns = useMemo(
    () => [
      { field: "flat_number", headerName: "Flat No", flex: 1 },
      { field: "floor_number", headerName: "Floor", flex: 1 },
      {
        field: "is_occupied",
        headerName: "Status",
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params.value ? "Occupied" : "Vacant"}
            color={params.value ? "success" : "warning"}
            size="small"
          />
        ),
      },
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
          {societyId && buildingId && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddModal(true)}
              sx={{
                textTransform: "none",
                px: 2,
                py: 0.8,
                borderRadius: 2,
                border: "1px solid #1e1ee4", // mimic outlined style
                color: "#1e1ee4",
              }}
            >
              Add Flat
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

      {/* ✅ Show Flats Table only when filters are applied */}
      {societyId && buildingId ? (
        <CommonDataGrid rows={flats} columns={columns} loading={loadingFlats} />
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Please select Society and Building from filters ➡️
        </Typography>
      )}

      {/* ✅ Sidebar Drawer for Filters */}
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

          {/* ✅ Society Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Society</InputLabel>
            <Select
              value={societyId}
              label="Society"
              onChange={(e) => {
                setSocietyId(e.target.value);
                setBuildingId("");
              }}
            >
              {loadingSocieties ? (
                <MenuItem disabled>Loading societies...</MenuItem>
              ) : (
                societies.map((society: any) => (
                  <MenuItem key={society.id} value={society.id}>
                    {society.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* ✅ Building Filter */}
          <FormControl fullWidth sx={{ mb: 3 }} disabled={!societyId}>
            <InputLabel>Building</InputLabel>
            <Select
              value={buildingId}
              label="Building"
              onChange={(e) => setBuildingId(e.target.value)}
            >
              {loadingBuildings ? (
                <MenuItem disabled>Loading buildings...</MenuItem>
              ) : (
                buildings.map((building: any) => (
                  <MenuItem key={building.id} value={building.id}>
                    {building.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setFilterOpen(false)}
            disabled={!societyId || !buildingId} // ✅ Must select both
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* ✅ Add Flat Modal */}
      <AddFlatModal
        open={addModal}
        onClose={() => setAddModal(false)}
        societyId={societyId}
        buildingId={buildingId}
      />
    </Container>
  );
}
