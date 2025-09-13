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
} from "@/services/assign-flats";

import AddIcon from "@mui/icons-material/Add";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export default function AssignFlatsPage() {
  const t = useTranslations("AssignFlatsPage");

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

  const columns = useMemo(() => {
    const isSuperAdminViewingAll = role === "super_admin";

    return [
      {
        field: "member_name",
        headerName: societyType === "commercial" ? "Owner" : "Resident",
        flex: 2,
      },
      // Housing unit fields - CLEAN VERSION
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
      // Flat/Shop fields - CLEAN VERSION
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
