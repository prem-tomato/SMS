"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import CreateAndAssignMemberModal from "@/components/user/CreateAndAssignMemberModal";
import {
  getSocietyIdFromLocalStorage,
  getSocietyTypeFromLocalStorage,
  getUserRole,
} from "@/lib/auth";
import { fetchAllUsers, fetchUsersBySociety } from "@/services/user";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export default function UsersPage() {
  const t = useTranslations("UsersPage");

  const [role, setRole] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<string>("");
  const [societyType, setSocietyType] = useState<string | null>(null);

  useEffect(() => {
    const role = getUserRole();
    const societyType = getSocietyTypeFromLocalStorage();
    setRole(role!);
    setSocietyType(societyType);

    if (role === "admin") {
      const societyId = getSocietyIdFromLocalStorage();
      if (societyId) setSelectedSociety(societyId);
    }
  }, []);

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
      { field: "first_name", headerName: t("firstName"), flex: 1 },
      { field: "last_name", headerName: t("lastName"), flex: 1 },
      { field: "role", headerName: t("role"), flex: 1 },
      { field: "phone", headerName: t("phone"), flex: 1 },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: t("society"), flex: 1 }]
        : []),
    ],
    [role, t]
  );

  return (
    <Box height="calc(100vh - 180px)">
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
          {t("addButton", {
            type: societyType === "commercial" ? t("shopOwner") : t("resident"),
          })}
        </Button>
      </Box>

      <CommonDataGrid
        rows={users}
        columns={columns}
        loading={loadingUsers}
        height="calc(100vh - 180px)" // Adjust based on header/toolbar height
        pageSize={20}
      />

      <CreateAndAssignMemberModal
        open={open}
        onClose={() => setOpen(false)}
        societyType={societyType as any}
      />
    </Box>
  );
}
