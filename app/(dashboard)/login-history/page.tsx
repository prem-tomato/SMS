"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  getLoginHistoryService,
  getLoginHistoryServiceBySocietyId,
} from "@/services/logins";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

export default function LoginsPage() {
  const [role, setRole] = useState<string>("");
  const [adminSocietyId, setAdminSocietyId] = useState<string>("");

  useEffect(() => {
    const userRole = getUserRole();
    const societyId = getSocietyIdFromLocalStorage();
    setRole(userRole!);
    setAdminSocietyId(societyId!);
  }, []);

  const { data: logins = [], isLoading } = useQuery({
    queryKey: ["logins"],
    queryFn: async () => {
      if (role === "admin" && adminSocietyId) {
        return getLoginHistoryServiceBySocietyId(adminSocietyId);
      }
      return getLoginHistoryService();
    },
    enabled: !!role,
  });

  const columns = useMemo(
    () => [
      { field: "user_name", headerName: "User", flex: 1 },
      {
        field: "login_time",
        headerName: "Login Time",
        flex: 1.2,
        renderCell: (params: any) =>
          dayjs(params.value).format("DD MMM YYYY, hh:mm A"),
      },
      { field: "login_ip", headerName: "IP Address", flex: 1 },
      { field: "device", headerName: "Device", flex: 1 },
      { field: "os", headerName: "OS", flex: 1 },
      { field: "browser", headerName: "Browser", flex: 1 },
      { field: "latitude", headerName: "Latitude", flex: 1 },
      { field: "longitude", headerName: "Longitude", flex: 1 },
      { field: "location", headerName: "Location", flex: 1 },
    ],
    []
  );

  return (
    <Box height="calc(100vh - 180px)">
      <CommonDataGrid
        rows={logins}
        columns={columns}
        loading={isLoading}
        height="calc(100vh - 117px)"
        pageSize={20}
      />
    </Box>
  );
}
