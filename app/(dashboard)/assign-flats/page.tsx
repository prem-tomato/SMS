"use client";

import AssignMemberModal from "@/components/assignMember/AssignMemberModal";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { fetchBuildingsBySociety } from "@/services/building";
import { fetchAssignedMembers, getVacantFlats } from "@/services/flats";
import { fetchSocietyOptions } from "@/services/societies";
import { fetchVacantUsersBySociety } from "@/services/user";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
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
import { useQuery, useQueryClient } from "@tanstack/react-query"; // ✅ NEW
import { useEffect, useMemo, useState } from "react";

export default function AssignFlatsPage() {
  const [societyId, setSocietyId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [flatId, setFlatId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);

  const queryClient = useQueryClient();

  const { data: societies = [], isLoading: lsSoc } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
  });

  const { data: buildings = [], isLoading: lsBld } = useQuery({
    queryKey: ["buildings", societyId],
    queryFn: () => fetchBuildingsBySociety(societyId),
    enabled: !!societyId,
  });

  const { data: vacantFlats = [], isLoading: lsFlats } = useQuery({
    queryKey: ["vacantFlats", societyId, buildingId],
    queryFn: () => getVacantFlats(societyId, buildingId),
    enabled: !!buildingId,
  });

  const { data: users = [], isLoading: lsUsers } = useQuery({
    queryKey: ["users", societyId],
    queryFn: () => fetchVacantUsersBySociety(societyId),
    enabled: !!societyId,
  });

  const { data: assigned = [], isLoading: lsAssigned } = useQuery({
    queryKey: ["assigned", societyId, buildingId],
    queryFn: () => fetchAssignedMembers(societyId, buildingId),
    enabled: !!buildingId,
  });

  const columns = useMemo(
    () => [
      {
        field: "members",
        headerName: "Members",
        flex: 2,
        sortable: false,
        filterable: true,
        disableColumnMenu: true,
        valueGetter: (params: any) =>
          params.row?.members
            ?.map((m: any) => `${m.first_name} ${m.last_name}`)
            .join(", ") || "",
        renderCell: (params: any) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              flexWrap: "wrap",
              whiteSpace: "normal",
              overflow: "visible",
              marginTop: 1.6,
            }}
          >
            {params.row?.members?.map((m: any, idx: number) => (
              <Chip
                key={idx}
                label={`${m.first_name} ${m.last_name}`}
                color="success"
                size="small"
              />
            ))}
          </Box>
        ),
      },
      {
        field: "flat_number",
        headerName: "Flat No",
        flex: 1,
        renderCell: (params: any) => (
          <Chip label={`Flat ${params.value}`} color="primary" size="small" />
        ),
      },
      {
        field: "floor_number",
        headerName: "Floor",
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={`Floor ${params.value}`}
            color="secondary"
            size="small"
          />
        ),
      },
      { field: "building_name", headerName: "Building", flex: 1 },
      { field: "society_name", headerName: "Society", flex: 1 },
    ],
    []
  );

  useEffect(() => {
    if (societyId && buildingId) {
      setFilterOpen(false);
    }
  }, [societyId, buildingId]);

  // ✅ Function to refresh dropdowns & table after assigning
  const handleAfterAssign = () => {
    queryClient.invalidateQueries({ queryKey: ["users", societyId] });
    queryClient.invalidateQueries({
      queryKey: ["vacantFlats", societyId, buildingId],
    });
    queryClient.invalidateQueries({
      queryKey: ["assigned", societyId, buildingId],
    });
  };

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
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

      {buildingId ? (
        <CommonDataGrid
          rows={assigned}
          columns={columns}
          loading={lsAssigned}
        />
      ) : (
        <Typography variant="body1" color="text.secondary">
          Please select a Society and Building from filters ➡️
        </Typography>
      )}

      {/* ✅ RIGHT SIDEBAR FILTER DRAWER */}
      <Drawer
        anchor="right"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
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

          {/* ✅ Society */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Society</InputLabel>
            <Select
              value={societyId}
              label="Society"
              onChange={(e) => {
                setSocietyId(e.target.value);
                setBuildingId("");
                setFlatId("");
              }}
            >
              {lsSoc ? (
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

          {/* ✅ Building */}
          <FormControl fullWidth disabled={!societyId} sx={{ mb: 2 }}>
            <InputLabel>Building</InputLabel>
            <Select
              value={buildingId}
              label="Building"
              onChange={(e) => {
                setBuildingId(e.target.value);
                setFlatId("");
              }}
            >
              {lsBld ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                buildings.map((b: any) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* ✅ Flat */}
          <FormControl fullWidth disabled={!buildingId} sx={{ mb: 3 }}>
            <InputLabel>Flat</InputLabel>
            <Select
              value={flatId}
              label="Flat"
              onChange={(e) => setFlatId(e.target.value)}
            >
              {lsFlats ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                vacantFlats.map((f: any) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.flat_number} – Floor {f.floor_number}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* ✅ Assign Members */}
          {societyId && buildingId && flatId && (
            <Button
              variant="outlined"
              color="success"
              fullWidth
              disabled={!flatId}
              onClick={() => {
                setModalOpen(true);
                setFilterOpen(false);
              }}
              startIcon={<AddIcon />}
            >
              Assign Members
            </Button>
          )}
        </Box>
      </Drawer>

      {/* ✅ Assign Modal */}
      <AssignMemberModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          handleAfterAssign(); // ✅ Refresh after closing modal
        }}
        societyId={societyId}
        buildingId={buildingId}
        flatId={flatId}
        users={users}
      />
    </Container>
  );
}
