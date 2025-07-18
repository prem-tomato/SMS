"use client";

import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import AssignMemberModal from "@/components/AssignMemberModal";
import { fetchBuildingsBySociety } from "@/services/building";
import { fetchAssignedMembers, getVacantFlats } from "@/services/flats";
import { fetchSocietyOptions } from "@/services/societies";
import { fetchVacantUsersBySociety } from "@/services/user";

export default function AssignFlatsPage() {
  const [societyId, setSocietyId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [flatId, setFlatId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" mb={3}>
        Assigned Members
      </Typography>

      {/* Society */}
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

      {/* Building */}
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

      {/* Flat */}
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

      {/* Assign Button */}
      {societyId && buildingId && flatId && (
        <Box mb={3}>
          <Button variant="contained" onClick={() => setModalOpen(true)}>
            Assign Members
          </Button>
        </Box>
      )}

      {/* Assigned Members List */}
      {lsAssigned ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        buildingId &&
        (assigned.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            p={3}
          >
            No members assigned to this building yet.
          </Typography>
        ) : (
          <List sx={{ bgcolor: "white", borderRadius: 2 }}>
            {assigned.map((a: any) => (
              <ListItem key={`${a.id}-${a.flat_number}`} divider>
                <ListItemText
                  primary={`${a.first_name} ${a.last_name}`}
                  secondary={`Flat: ${a.flat_number} • Floor ${a.floor_number}`}
                />
              </ListItem>
            ))}
          </List>
        ))
      )}

      <AssignMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        societyId={societyId}
        buildingId={buildingId}
        flatId={flatId}
        users={users}
      />
    </Container>
  );
}
