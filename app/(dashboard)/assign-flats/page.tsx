"use client";

import AssignMemberModal from "@/components/assignMember/AssignMemberModal";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  assignMemberListForAdmin,
  assignMemberListForSuperAdmin,
} from "@/services/assign-flats";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Chip } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export default function AssignFlatsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState<string>("");
  const [adminSocietyId, setAdminSocietyId] = useState<string>("");

  const queryClient = useQueryClient();

  // Get assigned members based on role
  const { data: assigned = [], isLoading: lsAssigned } = useQuery({
    queryKey: ["assignedMembers", role, adminSocietyId],
    queryFn: async () => {
      if (role === "super_admin") {
        return await assignMemberListForSuperAdmin();
      } else if (role === "admin" && adminSocietyId) {
        return await assignMemberListForAdmin(adminSocietyId);
      }
      return [];
    },
    enabled:
      !!role &&
      (role === "super_admin" || (role === "admin" && !!adminSocietyId)),
  });

  const columns = useMemo(
    () => [
      {
        field: "member_name",
        headerName: "Member",
        flex: 2,
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
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: "Society", flex: 1 }]
        : []),
      {
        field: "move_in_date",
        headerName: "move-in Date",
        flex: 1,
        renderCell: (params: any) => {
          const date = new Date(params.value);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        },
      },
    ],
    [role]
  );

  useEffect(() => {
    const userRole = getUserRole();
    setRole(userRole!);

    // Get society ID from localStorage for admin
    if (userRole === "admin") {
      const storedSocietyId = getSocietyIdFromLocalStorage(); // Adjust this key as needed
      if (storedSocietyId) {
        setAdminSocietyId(storedSocietyId);
      }
    }
  }, []);

  // Function to refresh data after assigning
  const handleAfterAssign = () => {
    queryClient.invalidateQueries({
      queryKey: ["assignedMembers", role, adminSocietyId],
    });
  };

  return (
    <Box height="calc(100vh - 100px)">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setModalOpen(true)}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 1,
            border: "1px solid #1e1ee4",
            color: "#1e1ee4",
          }}
        >
          Assign Members
        </Button>
      </Box>

      <CommonDataGrid
        rows={assigned}
        columns={columns}
        loading={lsAssigned}
        height="calc(100vh - 180px)" // Adjust based on header/toolbar height
        pageSize={20}
      />

      {/* Assign Modal */}
      <AssignMemberModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          handleAfterAssign();
        }}
        role={role}
        adminSocietyId={adminSocietyId}
      />
    </Box>
  );
}
