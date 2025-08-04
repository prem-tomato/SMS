"use client";

import AssignMemberModal from "@/components/assignMember/AssignMemberModal";
import CommonDataGrid from "@/components/common/CommonDataGrid";
import {
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
  getUserRole,
} from "@/lib/auth";
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
  const [societyType, setSocietyType] = useState<string | null>(null);

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

  // const columns = useMemo(
  //   () => [
  //     {
  //       field: "member_name",
  //       headerName: societyType === "commercial" ? "Owner" : "Resident",
  //       flex: 2,
  //     },
  //     // Housing unit fields (only for housing societies)
  //     ...(societyType === "housing"
  //       ? [
  //           { field: "unit_number", headerName: "Unit", flex: 1 },
  //           { field: "unit_type", headerName: "Type", flex: 1 },
  //           { field: "square_foot", headerName: "Size", flex: 1 },
  //         ]
  //       : []),
  //     // Flat/Shop fields (only for non-housing societies)
  //     ...(societyType !== "housing"
  //       ? [
  //           {
  //             field: "flat_number",
  //             headerName: societyType === "commercial" ? "Shop" : "Flat",
  //             flex: 1,
  //             renderCell: (params: any) => (
  //               <Chip
  //                 label={`${societyType === "commercial" ? "Shop" : "Flat"} ${
  //                   params.value
  //                 }`}
  //                 color="primary"
  //                 size="small"
  //               />
  //             ),
  //           },
  //           {
  //             field: "floor_number",
  //             headerName: "Floor",
  //             flex: 1,
  //             renderCell: (params: any) => (
  //               <Chip
  //                 label={`Floor ${params.value}`}
  //                 color="secondary"
  //                 size="small"
  //               />
  //             ),
  //           },
  //           { field: "building_name", headerName: "Building", flex: 1 },
  //         ]
  //       : []),
  //     // Society field (only for super admin)
  //     ...(role === "super_admin"
  //       ? [{ field: "society_name", headerName: "Society", flex: 1 }]
  //       : []),
  //     {
  //       field: "move_in_date",
  //       headerName: "Move-in Date",
  //       flex: 1,
  //       renderCell: (params: any) => {
  //         const date = new Date(params.value);
  //         return date.toLocaleDateString("en-GB", {
  //           day: "2-digit",
  //           month: "long",
  //           year: "numeric",
  //         });
  //       },
  //     },
  //   ],
  //   [role, societyType]
  // );

  const columns = useMemo(() => {
    // For super admin, show all possible columns since they see mixed data
    const isSuperAdminViewingAll = role === "super_admin" && !societyType;

    return [
      {
        field: "member_name",
        headerName: "Resident/Owner",
        flex: 2,
      },
      // Housing unit fields (show for housing societies or super admin viewing all)
      ...(societyType === "housing" || isSuperAdminViewingAll
        ? [
            {
              field: "unit_number",
              headerName: "Unit",
              flex: 1,
              renderCell: (params: any) => {
                if (!params.value) return null;
                return (
                  <Chip label={params.value} color="success" size="small" />
                );
              },
            },
            {
              field: "unit_type",
              headerName: "Unit Type",
              flex: 1,
              renderCell: (params: any) => {
                if (!params.value) return null;
                return <Chip label={params.value} color="info" size="small" />;
              },
            },
          ]
        : []),
      // Flat/Shop fields (show for non-housing societies or super admin viewing all)
      ...(societyType !== "housing" || isSuperAdminViewingAll
        ? [
            {
              field: "flat_number",
              headerName: "Flat/Shop",
              flex: 1,
              renderCell: (params: any) => {
                if (!params.value) return null;
                const row = params.row;
                const isCommercial = row.assignment_type === "commercial";
                const label = isCommercial
                  ? `Shop ${params.value}`
                  : `Flat ${params.value}`;
                return <Chip label={label} color="primary" size="small" />;
              },
            },
            {
              field: "floor_number",
              headerName: "Floor",
              flex: 1,
              renderCell: (params: any) => {
                if (!params.value) return null;
                return (
                  <Chip
                    label={`Floor ${params.value}`}
                    color="secondary"
                    size="small"
                  />
                );
              },
            },
            {
              field: "building_name",
              headerName: "Building",
              flex: 1,
              renderCell: (params: any) => {
                if (!params.value) return null;
                return params.value;
              },
            },
          ]
        : []),
      // Society field (always show for super admin)
      ...(role === "super_admin"
        ? [
            {
              field: "society_name",
              headerName: "Society",
              flex: 1.5,
              renderCell: (params: any) => (
                <Chip
                  label={params.value}
                  color="default"
                  size="small"
                  variant="outlined"
                />
              ),
            },
          ]
        : []),
      {
        field: "move_in_date",
        headerName: "Move-in Date",
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
    ];
  }, [role, societyType]);

  useEffect(() => {
    const userRole = getUserRole();
    setRole(userRole!);

    // Get society ID from localStorage for admin
    if (userRole === "admin") {
      const storedSocietyId = getSocietyIdFromLocalStorage(); // Adjust this key as needed
      const storedSocietyType = getSocietyTypeFromLocalStorage();
      if (storedSocietyId) {
        setAdminSocietyId(storedSocietyId);
        setSocietyType(storedSocietyType);
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
    <Box height="calc(100vh - 160px)">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {role && role !== "super_admin" && (
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
            {societyType === "commercial"
              ? "Assign Shop"
              : societyType === "housing"
              ? "Assign Unit"
              : "Assign Flat"}
          </Button>
        )}
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
        societyType={societyType!}
      />
    </Box>
  );
}
