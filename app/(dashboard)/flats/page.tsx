// ✅ Optimized FlatsPage.tsx
"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddFlatModal from "@/components/flat/FlatModel";
import { listAllFlats, listAllFlatsBySociety } from "@/services/flats";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Chip, Container } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export default function FlatsPage() {
  const [addModal, setAddModal] = useState(false);
  const [societyId, setSocietyId] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("role") || "";
    const storedSocietyId = localStorage.getItem("society_id") || "";
    setRole(userRole);
    if (userRole === "admin") setSocietyId(storedSocietyId);
  }, []);

  const { data: flats = [], isLoading } = useQuery({
    queryKey: ["flats", societyId],
    queryFn: () =>
      role === "super_admin"
        ? listAllFlats()
        : listAllFlatsBySociety(societyId),
    enabled: role === "super_admin" || !!societyId,
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
      { field: "building_name", headerName: "Building", flex: 1 },
      { field: "society_name", headerName: "Society", flex: 1 },
    ],
    []
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setAddModal(true)}
          startIcon={<AddIcon />}
          sx={{ borderRadius: 1, borderColor: "#1e1ee4", color: "#1e1ee4" }}
        >
          Add Flat
        </Button>
      </Box>

      <CommonDataGrid rows={flats} columns={columns} loading={isLoading} />

      <AddFlatModal
        open={addModal}
        onClose={() => setAddModal(false)}
        role={role}
        societyId={societyId}
      />
    </Container>
  );
}
