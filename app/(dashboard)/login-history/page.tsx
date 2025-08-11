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
import { useTranslations } from "next-intl";

export default function LoginsPage() {
  const t = useTranslations("LoginsPage");

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
      { field: "user_name", headerName: t("columns.user"), flex: 1 },
      {
        field: "login_time",
        headerName: t("columns.loginTime"),
        flex: 1.2,
        renderCell: (params: any) =>
          dayjs(params.value).format("DD MMM YYYY, hh:mm A"),
      },
      { field: "login_ip", headerName: t("columns.ipAddress"), flex: 1 },
      { field: "device", headerName: t("columns.device"), flex: 1 },
      { field: "os", headerName: t("columns.os"), flex: 1 },
      { field: "browser", headerName: t("columns.browser"), flex: 1 },
      { field: "latitude", headerName: t("columns.latitude"), flex: 1 },
      { field: "longitude", headerName: t("columns.longitude"), flex: 1 },
      { field: "location", headerName: t("columns.location"), flex: 1 },
    ],
    [t]
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
