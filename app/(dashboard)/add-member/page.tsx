"use client";

import AddUserModal from "@/components/user/AddUserModal";
import { fetchSocietyOptions } from "@/services/societies";
import { fetchUsersBySociety } from "@/services/user";
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

export default function UsersPage() {
  const [societyId, setSocietyId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users", societyId],
    queryFn: () => fetchUsersBySociety(societyId),
    enabled: !!societyId,
  });

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" mb={3}>Add Member</Typography>

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
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {societyId && (
        <Box mb={2}>
          <Button variant="contained" onClick={() => setModalOpen(true)}>
            Add Member
          </Button>
        </Box>
      )}

      {loadingUsers && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {!loadingUsers && societyId && (
        users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" p={3}>
            No users found.
          </Typography>
        ) : (
          <List sx={{ bgcolor: "white", borderRadius: 2 }}>
            {users.map((u: any) => (
              <ListItem key={u.id} divider>
                <ListItemText
                  primary={`${u.first_name} ${u.last_name} (${u.role})`}
                  secondary={`Phone: ${u.phone}`}
                />
              </ListItem>
            ))}
          </List>
        )
      )}

      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        societyId={societyId}
      />
    </Container>
  );
}
