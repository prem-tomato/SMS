"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddUserModal from "@/components/user/AddUserModal";
import { getUserRole } from "@/lib/auth";
import { fetchSocietyOptions } from "@/services/societies";
import { fetchAllUsers, fetchUsersBySociety } from "@/services/user";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export default function UsersPage() {
  const role = getUserRole();
  const [open, setOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<string>("");
  const [societyName, setSocietyName] = useState<string>("");

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["society-options"],
    queryFn: fetchSocietyOptions,
    enabled: role === "super_admin",
  });

  useEffect(() => {
    if (role === "admin") {
      const societyId = localStorage.getItem("society_id");
      const storedSocietyName = localStorage.getItem("society_name");
      if (societyId) setSelectedSociety(societyId);
      if (storedSocietyName) setSocietyName(storedSocietyName);
    }
  }, [role]);

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users", selectedSociety],
    queryFn: () =>
      role === "super_admin"
        ? fetchAllUsers()
        : fetchUsersBySociety(selectedSociety),
    enabled: !!selectedSociety || role === "super_admin",
  });

  const columns = useMemo(
    () => [
      { field: "first_name", headerName: "First Name", flex: 1 },
      { field: "last_name", headerName: "Last Name", flex: 1 },
      { field: "role", headerName: "Role", flex: 1 },
      { field: "phone", headerName: "Phone", flex: 1 },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: "Society Name", flex: 1 }]
        : []),
    ],
    []
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            borderRadius: 1,
            border: "1px solid #1e1ee4",
            color: "#1e1ee4",
          }}
        >
          Add Member
        </Button>
      </Box>

      <CommonDataGrid rows={users} columns={columns} loading={loadingUsers} />

      <AddUserModal
        open={open}
        onClose={() => setOpen(false)}
        societyId={selectedSociety}
      />
    </Container>
  );
}
