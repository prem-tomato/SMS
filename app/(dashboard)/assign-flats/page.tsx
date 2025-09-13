// "use client";

// import AssignMemberModal from "@/components/assignMember/AssignMemberModal";
// import CommonDataGrid from "@/components/common/CommonDataGrid";
// import {
//   getSocietyIdFromLocalStorage,
//   getSocietyTypeFromLocalStorage,
//   getUserRole,
// } from "@/lib/auth";
// import {
//   assignMemberListForAdmin,
//   assignMemberListForSuperAdmin,
// } from "@/services/assign-flats";

// import AddIcon from "@mui/icons-material/Add";
// import { Box, Button, Chip, Stack } from "@mui/material";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useTranslations } from "next-intl";
// import { useEffect, useMemo, useState } from "react";

// export default function AssignFlatsPage() {
//   const t = useTranslations("AssignFlatsPage");

//   const [modalOpen, setModalOpen] = useState(false);
//   const [role, setRole] = useState<string>("");
//   const [adminSocietyId, setAdminSocietyId] = useState<string>("");
//   const [societyType, setSocietyType] = useState<string | null>(null);

//   const queryClient = useQueryClient();

//   // Get assigned members based on role
//   const { data: assigned = [], isLoading: lsAssigned } = useQuery({
//     queryKey: ["assignedMembers", role, adminSocietyId],
//     queryFn: async () => {
//       if (role === "super_admin") {
//         return await assignMemberListForSuperAdmin();
//       } else if (role === "admin" && adminSocietyId) {
//         return await assignMemberListForAdmin(adminSocietyId);
//       }
//       return [];
//     },
//     enabled:
//       !!role &&
//       (role === "super_admin" || (role === "admin" && !!adminSocietyId)),
//   });

//   const columns = useMemo(() => {
//     // For super admin, show all possible columns since they see mixed data
//     const isSuperAdminViewingAll = role === "super_admin";

//     return [
//       {
//         field: "member_name",
//         headerName: societyType === "commercial" ? "Owner" : "Resident",
//         flex: 2,
//       },
//       // Housing unit fields (show for housing societies or super admin viewing all)
//       ...(societyType === "housing" || isSuperAdminViewingAll
//         ? [
//             {
//               field: "housing_units",
//               headerName: "Units Assigned",
//               flex: 2.5,
//               renderCell: (params: any) => {
//                 const housingUnits = params.value;
//                 if (
//                   !housingUnits ||
//                   !Array.isArray(housingUnits) ||
//                   housingUnits.length === 0
//                 ) {
//                   return <span>-</span>;
//                 }

//                 return (
//                   <Stack
//                     direction="row"
//                     spacing={0.5}
//                     sx={{
//                       flexWrap: "wrap",
//                       gap: 0.5,
//                       maxWidth: "100%",
//                       overflow: "hidden",
//                     }}
//                   >
//                     {housingUnits.map((unit, index) => {
//                       if (index >= 3 && housingUnits.length > 3) {
//                         if (index === 3) {
//                           return (
//                             <Chip
//                               key={`more-${index}`}
//                               label={`+${housingUnits.length - 3} more`}
//                               color="default"
//                               size="small"
//                               variant="outlined"
//                             />
//                           );
//                         }
//                         return null;
//                       }

//                       return (
//                         <Chip
//                           key={unit.housing_id}
//                           label={unit.unit_number}
//                           color="success"
//                           size="small"
//                           sx={{ fontSize: "0.75rem" }}
//                         />
//                       );
//                     })}
//                   </Stack>
//                 );
//               },
//             },
//             {
//               field: "unit_types",
//               headerName: "Unit Types",
//               flex: 1.5,
//               renderCell: (params: any) => {
//                 const housingUnits = params.row.housing_units;
//                 if (
//                   !housingUnits ||
//                   !Array.isArray(housingUnits) ||
//                   housingUnits.length === 0
//                 ) {
//                   return <span>-</span>;
//                 }

//                 // Get unique unit types
//                 const uniqueTypes = [
//                   ...(new Set(
//                     housingUnits.map((unit) => unit.unit_type).filter(Boolean)
//                   ) as any),
//                 ];

//                 return (
//                   <Stack
//                     direction="row"
//                     spacing={0.5}
//                     sx={{ flexWrap: "wrap", gap: 0.5 }}
//                   >
//                     {uniqueTypes.slice(0, 2).map((type, index) => (
//                       <Chip
//                         key={`type-${type}-${index}`}
//                         label={type}
//                         color="info"
//                         size="small"
//                         sx={{ fontSize: "0.75rem" }}
//                       />
//                     ))}
//                     {uniqueTypes.length > 2 && (
//                       <Chip
//                         label={`+${uniqueTypes.length - 2}`}
//                         color="default"
//                         size="small"
//                         variant="outlined"
//                       />
//                     )}
//                   </Stack>
//                 );
//               },
//             },
//           ]
//         : []),
//       // Flat/Shop fields (show for non-housing societies or super admin viewing all)
//       ...(societyType !== "housing" || isSuperAdminViewingAll
//         ? [
//             {
//               field: "flats",
//               headerName:
//                 societyType === "commercial"
//                   ? "Shops Assigned"
//                   : "Flats Assigned",
//               flex: 2.5,
//               renderCell: (params: any) => {
//                 const flats = params.value;
//                 if (!flats || !Array.isArray(flats) || flats.length === 0) {
//                   return <span>-</span>;
//                 }

//                 return (
//                   <Stack
//                     direction="row"
//                     spacing={0.5}
//                     sx={{
//                       flexWrap: "wrap",
//                       gap: 0.5,
//                       maxWidth: "100%",
//                       overflow: "hidden",
//                     }}
//                   >
//                     {flats.map((flat, index) => {
//                       if (index >= 3 && flats.length > 3) {
//                         if (index === 3) {
//                           return (
//                             <Chip
//                               key={`more-${index}`}
//                               label={`+${flats.length - 3} more`}
//                               color="default"
//                               size="small"
//                               variant="outlined"
//                             />
//                           );
//                         }
//                         return null;
//                       }

//                       const isCommercial = societyType === "commercial";
//                       const label = isCommercial
//                         ? `Shop ${flat.flat_number}`
//                         : `Flat ${flat.flat_number}`;

//                       return (
//                         <Chip
//                           key={flat.flat_id}
//                           label={label}
//                           color="primary"
//                           size="small"
//                           sx={{ fontSize: "0.75rem" }}
//                         />
//                       );
//                     })}
//                   </Stack>
//                 );
//               },
//             },
//             {
//               field: "floors",
//               headerName: "Floors",
//               flex: 1.5,
//               renderCell: (params: any) => {
//                 const flats = params.row.flats;
//                 if (!flats || !Array.isArray(flats) || flats.length === 0) {
//                   return <span>-</span>;
//                 }

//                 // Get unique floor numbers
//                 const uniqueFloors = [
//                   ...(new Set(flats.map((flat) => flat.floor_number)) as any),
//                 ];

//                 return (
//                   <Stack
//                     direction="row"
//                     spacing={0.5}
//                     sx={{ flexWrap: "wrap", gap: 0.5 }}
//                   >
//                     {uniqueFloors.slice(0, 3).map((floor, index) => {
//                       const label =
//                         floor === 0 ? "Ground Floor" : `Floor ${floor}`;
//                       return (
//                         <Chip
//                           key={`floor-${floor}-${index}`}
//                           label={label}
//                           color="secondary"
//                           size="small"
//                           sx={{ fontSize: "0.75rem" }}
//                         />
//                       );
//                     })}
//                     {uniqueFloors.length > 3 && (
//                       <Chip
//                         label={`+${uniqueFloors.length - 3}`}
//                         color="default"
//                         size="small"
//                         variant="outlined"
//                       />
//                     )}
//                   </Stack>
//                 );
//               },
//             },
//             {
//               field: "building_name",
//               headerName: "Building",
//               flex: 1,
//               renderCell: (params: any) =>
//                 params.value ? (
//                   <Chip
//                     label={params.value}
//                     color="default"
//                     size="small"
//                     variant="outlined"
//                   />
//                 ) : (
//                   "-"
//                 ),
//             },
//           ]
//         : []),
//       // Society field (always show for super admin)
//       ...(role === "super_admin"
//         ? [
//             {
//               field: "society_name",
//               headerName: "Society",
//               flex: 1.5,
//               renderCell: (params: any) => (
//                 <Chip
//                   label={params.value}
//                   color="default"
//                   size="small"
//                   variant="outlined"
//                 />
//               ),
//             },
//           ]
//         : []),
//       {
//         field: "move_in_date",
//         headerName: "Move-in Date",
//         flex: 1,
//         renderCell: (params: any) => {
//           const date = new Date(params.value);
//           return date.toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "long",
//             year: "numeric",
//           });
//         },
//       },
//     ];
//   }, [role, societyType]);

//   useEffect(() => {
//     const userRole = getUserRole();
//     setRole(userRole!);

//     // Get society ID from localStorage for admin
//     if (userRole === "admin") {
//       const storedSocietyId = getSocietyIdFromLocalStorage();
//       const storedSocietyType = getSocietyTypeFromLocalStorage();
//       if (storedSocietyId) {
//         setAdminSocietyId(storedSocietyId);
//         setSocietyType(storedSocietyType);
//       }
//     }
//   }, []);

//   // Function to refresh data after assigning
//   const handleAfterAssign = () => {
//     queryClient.invalidateQueries({
//       queryKey: ["assignedMembers", role, adminSocietyId],
//     });
//   };

//   return (
//     <Box height="calc(100vh - 160px)">
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 2,
//         }}
//       >
//         {role && role !== "super_admin" && (
//           <Button
//             variant="outlined"
//             onClick={() => setModalOpen(true)}
//             startIcon={<AddIcon />}
//             sx={{
//               borderRadius: 1,
//               border: "1px solid #1e1ee4",
//               color: "#1e1ee4",
//             }}
//           >
//             {societyType === "commercial"
//               ? "Assign Shop"
//               : societyType === "housing"
//               ? "Assign Unit"
//               : "Assign Flat"}
//           </Button>
//         )}
//       </Box>

//       <CommonDataGrid
//         rows={assigned}
//         columns={columns}
//         loading={lsAssigned}
//         height="calc(100vh - 180px)"
//         pageSize={20}
//       />

//       {/* Assign Modal */}
//       <AssignMemberModal
//         open={modalOpen}
//         onClose={() => {
//           setModalOpen(false);
//           handleAfterAssign();
//         }}
//         role={role}
//         adminSocietyId={adminSocietyId}
//         societyType={societyType!}
//       />
//     </Box>
//   );
// }
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
  deleteAssignMemberService,
  deleteAssignUnitService,
} from "@/services/assign-flats";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

interface DeleteDialogState {
  open: boolean;
  memberData: any;
  memberName: string;
  selectedFlat: any | null;
  selectedUnit: any | null;
}

export default function AssignFlatsPage() {
  const t = useTranslations("AssignFlatsPage");

  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState<string>("");
  const [adminSocietyId, setAdminSocietyId] = useState<string>("");
  const [societyType, setSocietyType] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [deletingType, setDeletingType] = useState<"flat" | "unit" | null>(
    null
  );
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    memberData: null,
    memberName: "",
    selectedFlat: null,
    selectedUnit: null,
  });

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

  // Mutation for deleting FLATS/SHOPS
  const deleteFlatMutation = useMutation({
    mutationFn: ({
      societyId,
      buildingId,
      flatId,
      assignMemberId,
    }: {
      societyId: string;
      buildingId: string;
      flatId: string;
      assignMemberId: string;
    }) =>
      deleteAssignMemberService(societyId, buildingId, flatId, assignMemberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignedMembers", role, adminSocietyId],
      });
      setDeleteDialog({
        open: false,
        memberData: null,
        memberName: "",
        selectedFlat: null,
        selectedUnit: null,
      });
      setAnchorEl(null);
      setSelectedRow(null);
      setDeletingType(null); // 👈 Clear loading state on success
    },
    onError: (error: any) => {
      console.error("Failed to delete flat:", error);
      setDeletingType(null); // 👈 Clear loading state on error
    },
  });

  // Mutation for deleting HOUSING UNITS
  const deleteUnitMutation = useMutation({
    mutationFn: ({
      societyId,
      housingId,
      assignUnitId,
    }: {
      societyId: string;
      housingId: string;
      assignUnitId: string;
    }) => deleteAssignUnitService(societyId, housingId, assignUnitId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignedMembers", role, adminSocietyId],
      });
      setDeleteDialog({
        open: false,
        memberData: null,
        memberName: "",
        selectedFlat: null,
        selectedUnit: null,
      });
      setAnchorEl(null);
      setSelectedRow(null);
      setDeletingType(null); // 👈 Clear loading state on success
    },
    onError: (error: any) => {
      console.error("Failed to delete unit:", error);
      setDeletingType(null); // 👈 Clear loading state on error
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleDeleteClick = () => {
    if (selectedRow) {
      setDeleteDialog({
        open: true,
        memberData: selectedRow,
        memberName: selectedRow.member_name || "",
        selectedFlat: null,
        selectedUnit: null,
      });
    }
    handleMenuClose();
  };

  const handleDeleteFlat = async (flat: any) => {
    if (!flat?.flat_id || !flat?.assign_member_id) {
      console.error("Invalid flat:", flat);
      return;
    }

    setDeletingType("flat");

    await deleteFlatMutation.mutateAsync({
      societyId: role === "admin" ? adminSocietyId : flat.society_id,
      buildingId: flat.building_id,
      flatId: flat.flat_id,
      assignMemberId: flat.assign_member_id,
    });
  };

  const handleDeleteUnit = async (unit: any) => {
    if (!unit?.housing_id || !unit?.assign_unit_id) {
      console.error("Invalid unit:", unit);
      return;
    }

    setDeletingType("unit");

    await deleteUnitMutation.mutateAsync({
      societyId: role === "admin" ? adminSocietyId : unit.society_id,
      housingId: unit.housing_id,
      assignUnitId: unit.assign_unit_id,
    });
  };

  const columns = useMemo(() => {
    const isSuperAdminViewingAll = role === "super_admin";

    return [
      {
        field: "member_name",
        headerName: societyType === "commercial" ? "Owner" : "Resident",
        flex: 2,
      },
      // Housing unit fields
      ...(societyType === "housing" || isSuperAdminViewingAll
        ? [
            {
              field: "housing_units",
              headerName: "Units",
              flex: 1.5,
              renderCell: (params: any) => {
                const housingUnits = params.value;
                if (
                  !housingUnits ||
                  !Array.isArray(housingUnits) ||
                  housingUnits.length === 0
                ) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      None
                    </Typography>
                  );
                }

                const uniqueTypes = [
                  ...(new Set(
                    housingUnits.map((unit) => unit.unit_type).filter(Boolean)
                  ) as any),
                ];

                return (
                  <Tooltip
                    title={
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold", display: "block", mb: 1 }}
                        >
                          Assigned Units:
                        </Typography>
                        {housingUnits.map((unit) => (
                          <Typography
                            key={unit.housing_id}
                            variant="caption"
                            display="block"
                          >
                            {unit.unit_number} ({unit.unit_type}) -{" "}
                            {unit.square_foot} sq ft
                          </Typography>
                        ))}
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                          bgcolor: "success.main",
                        }}
                      >
                        {housingUnits.length}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {housingUnits.length} unit
                          {housingUnits.length > 1 ? "s" : ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {uniqueTypes.join(", ")}
                        </Typography>
                      </Box>
                    </Stack>
                  </Tooltip>
                );
              },
            },
          ]
        : []),
      // Flat/Shop fields
      ...(societyType !== "housing" || isSuperAdminViewingAll
        ? [
            {
              field: "flats",
              headerName: societyType === "commercial" ? "Shops" : "Flats",
              flex: 1.8,
              renderCell: (params: any) => {
                const flats = params.value;
                if (!flats || !Array.isArray(flats) || flats.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      None
                    </Typography>
                  );
                }

                const uniqueFloors = [
                  ...(new Set(flats.map((f) => f.floor_number)) as any),
                ].sort();
                const flatNumbers = flats
                  .map((f) => f.flat_number)
                  .sort()
                  .join(", ");
                const displayNumbers =
                  flatNumbers.length > 15
                    ? flatNumbers.substring(0, 15) + "..."
                    : flatNumbers;

                return (
                  <Tooltip
                    title={
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold", display: "block", mb: 1 }}
                        >
                          {societyType === "commercial"
                            ? "Assigned Shops:"
                            : "Assigned Flats:"}
                        </Typography>
                        {flats.map((flat) => (
                          <Typography
                            key={flat.flat_id}
                            variant="caption"
                            display="block"
                          >
                            {societyType === "commercial" ? "Shop" : "Flat"}{" "}
                            {flat.flat_number} - Floor {flat.floor_number}
                          </Typography>
                        ))}
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                          bgcolor: "primary.main",
                        }}
                      >
                        {flats.length}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500 }}
                          noWrap
                        >
                          {displayNumbers}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Floor{uniqueFloors.length > 1 ? "s" : ""}:{" "}
                          {uniqueFloors.join(", ")}
                        </Typography>
                      </Box>
                    </Stack>
                  </Tooltip>
                );
              },
            },
            {
              field: "building_name",
              headerName: "Building",
              flex: 1,
              renderCell: (params: any) =>
                params.value ? (
                  <Chip
                    label={params.value}
                    color="default"
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                ),
            },
          ]
        : []),
      // Society field (only for super admin)
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
        flex: 1.2,
        renderCell: (params: any) => {
          const date = new Date(params.value);
          return (
            <Typography variant="body2">
              {date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Typography>
          );
        },
      },
      // Actions column
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.5,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params: any) => (
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row)}
            sx={{ color: "text.secondary" }}
          >
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ];
  }, [role, societyType]);

  useEffect(() => {
    const userRole = getUserRole();
    setRole(userRole!);

    // Get society ID from localStorage for admin
    if (userRole === "admin") {
      const storedSocietyId = getSocietyIdFromLocalStorage();
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
        height="calc(100vh - 180px)"
        pageSize={20}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 120 },
        }}
      >
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
          <Typography color="error.main">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => {
          setDeleteDialog({
            open: false,
            memberData: null,
            memberName: "",
            selectedFlat: null,
            selectedUnit: null,
          });
          setDeletingType(null); // 👈 CRITICAL: Clear loading state on ANY close
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Assignments for {deleteDialog.memberName}
        </DialogTitle>
        <DialogContent>
          {deletingType && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Deleting {deletingType === "flat" ? "flat/shop" : "unit"}...
              </Typography>
            </Box>
          )}

          {!deletingType && deleteDialog.memberData && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Select which assignment to delete. This action cannot be undone.
              </Alert>

              {/* Show flats if available */}
              {deleteDialog.memberData.flats &&
                deleteDialog.memberData.flats.length > 0 && (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {societyType === "commercial" ? "Shops" : "Flats"}:
                    </Typography>
                    <List>
                      {deleteDialog.memberData.flats.map((flat: any) => (
                        <ListItemButton
                          key={flat.flat_id}
                          onClick={() => handleDeleteFlat(flat)}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            mb: 1,
                          }}
                          disabled={deletingType !== null} // 👈 Prevent clicks during deletion
                        >
                          <ListItemText
                            primary={`${
                              societyType === "commercial" ? "Shop" : "Flat"
                            } ${flat.flat_number}`}
                            secondary={`Floor ${
                              flat.floor_number
                            } - Building: ${flat.building_name || "N/A"}`}
                          />
                          <DeleteIcon color="error" />
                        </ListItemButton>
                      ))}
                    </List>
                  </>
                )}

              {/* Show housing units if available */}
              {deleteDialog.memberData.housing_units &&
                deleteDialog.memberData.housing_units.length > 0 && (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, mt: 2 }}
                    >
                      Housing Units:
                    </Typography>
                    <List>
                      {deleteDialog.memberData.housing_units.map(
                        (unit: any) => (
                          <ListItemButton
                            key={unit.housing_id}
                            onClick={() => handleDeleteUnit(unit)}
                            sx={{
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 1,
                              mb: 1,
                            }}
                            disabled={deletingType !== null} // 👈 Prevent clicks during deletion
                          >
                            <ListItemText
                              primary={`Unit ${unit.unit_number}`}
                              secondary={`${unit.unit_type} - ${unit.square_foot} sq ft`}
                            />
                            <DeleteIcon color="error" />
                          </ListItemButton>
                        )
                      )}
                    </List>
                  </>
                )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialog({
                open: false,
                memberData: null,
                memberName: "",
                selectedFlat: null,
                selectedUnit: null,
              });
              setDeletingType(null); // 👈 Consistent cleanup
            }}
            color="inherit"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

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
