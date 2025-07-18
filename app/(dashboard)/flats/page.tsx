'use client';

import AddFlatModal from '@/components/flat/FlatModel';
import { fetchBuildingsBySociety } from '@/services/building';
import { fetchFlats } from '@/services/flats';
import { fetchSocietyOptions } from '@/services/societies';
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
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function FlatsPage() {
  const [societyId, setSocietyId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [addModal, setAddModal] = useState(false);

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ['societies'],
    queryFn: fetchSocietyOptions,
  });

  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ['buildings', societyId],
    queryFn: () => fetchBuildingsBySociety(societyId),
    enabled: !!societyId,
  });

  const { data: flats = [], isLoading: loadingFlats } = useQuery({
    queryKey: ['flats', societyId, buildingId],
    queryFn: () => fetchFlats(societyId, buildingId),
    enabled: !!societyId && !!buildingId,
  });

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Flats</Typography>

      {/* Society Dropdown */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Society</InputLabel>
        <Select
          value={societyId}
          label="Society"
          onChange={(e) => {
            setSocietyId(e.target.value);
            setBuildingId('');
          }}
        >
          {loadingSocieties ? (
            <MenuItem disabled>Loading societies...</MenuItem>
          ) : (
            societies.map((society: any) => (
              <MenuItem key={society.id} value={society.id}>{society.name}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* Building Dropdown */}
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
              <MenuItem key={building.id} value={building.id}>{building.name}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* ✅ Add Flat Button */}
      {societyId && buildingId && (
        <Box mb={3}>
          <Button variant="contained" onClick={() => setAddModal(true)}>
            Add Flat
          </Button>
        </Box>
      )}

      {/* Flats List */}
      {loadingFlats && (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      )}

      {!loadingFlats && buildingId && (
        <List sx={{ bgcolor: 'white', borderRadius: 2 }}>
          {flats.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" p={3}>No flats found</Typography>
          ) : (
            flats.map((flat: any) => (
              <ListItem key={flat.id} divider>
                <ListItemText
                  primary={`Flat: ${flat.flat_number}`}
                  secondary={`Floor: ${flat.floor_number ?? 'N/A'} • ${flat.is_occupied ? 'Occupied' : 'Vacant'}`}
                />
              </ListItem>
            ))
          )}
        </List>
      )}

      <AddFlatModal
        open={addModal}
        onClose={() => setAddModal(false)}
        societyId={societyId}
        buildingId={buildingId}
      />
    </Container>
  );
}
