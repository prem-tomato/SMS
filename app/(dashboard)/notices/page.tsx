"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddNoticeModal from "@/components/notices/AddNoticeModal";
import { getSocietyIdFromLocalStorage, getUserRole } from "@/lib/auth";
import {
  fetchNotices,
  getAllNotices,
  toggleNoticeStatus,
} from "@/services/notices";
import { fetchSocietyOptions } from "@/services/societies";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Chip } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export default function NoticesPage() {
  const t = useTranslations("NoticesPage");

  const [addModal, setAddModal] = useState(false);
  const [societyId, setSocietyId] = useState("");
  const [role, setRole] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Role and society init
  useEffect(() => {
    const storedRole = getUserRole();
    const storedSocietyId = getSocietyIdFromLocalStorage();
    setRole(storedRole);

    if (
      storedRole === "admin" ||
      (storedRole === "member" && storedSocietyId)
    ) {
      setSocietyId(storedSocietyId!);
    }
  }, []);

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
    enabled: role === "super_admin",
  });

  const { data: notices = [], isLoading: loadingNotices } = useQuery({
    queryKey: ["notices", societyId, role],
    queryFn: () =>
      role === "super_admin" ? getAllNotices() : fetchNotices(societyId),
    enabled: role === "super_admin" || societyId !== "",
  });

  const { mutate: toggleStatus, isPending: toggling } = useMutation({
    mutationFn: ({
      societyId,
      noticeId,
    }: {
      societyId: string;
      noticeId: string;
    }) => toggleNoticeStatus(societyId, noticeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices", societyId, role] });
    },
  });

  // const columns = useMemo(() => [
  //   {
  //     field: "title",
  //     headerName: "Title",
  //     flex: 1,
  //     minWidth: 200,
  //   },
  //   {
  //     field: "content",
  //     headerName: "Content",
  //     flex: 2,
  //     minWidth: 300,
  //   },
  //   {
  //     field: "status",
  //     headerName: "Status",
  //     flex: 1,
  //     renderCell: (params: any) => (
  //       <Chip
  //         label={params.value?.toUpperCase()}
  //         color={params.value === "open" ? "warning" : "default"}
  //         size="small"
  //       />
  //     ),
  //   },
  //   {
  //     field: "created_by",
  //     headerName: "Created By",
  //     flex: 1,
  //   },
  //   {
  //     field: "created_at",
  //     headerName: "Date",
  //     flex: 1,
  //     renderCell: (params: any) => {
  //       const date = new Date(params.row.created_at);
  //       return date.toLocaleDateString("en-GB", {
  //         day: "2-digit",
  //         month: "long",
  //         year: "numeric",
  //       });
  //     },
  //   },
  //   {
  //     field: "actions",
  //     headerName: "Actions",
  //     flex: 1,
  //     renderCell: (params: any) =>
  //       societyId ? (
  //         <Button
  //           size="small"
  //           variant="outlined"
  //           disabled={toggling}
  //           onClick={() =>
  //             toggleStatus({ societyId, noticeId: params.row.id })
  //           }
  //           sx={{ textTransform: "none", fontSize: "0.75rem" }}
  //         >
  //           {params.row.status === "open" ? "Close" : "Re-Open"}
  //         </Button>
  //       ) : null,
  //   },
  // ], [societyId, toggling]);

  const columns = useMemo(() => {
    return [
      {
        field: "title",
        headerName: t("columns.title"),
        flex: 1,
        minWidth: 200,
      },
      {
        field: "content",
        headerName: t("columns.content"),
        flex: 2,
        minWidth: 300,
      },
      {
        field: "status",
        headerName: t("columns.status"),
        flex: 1,
        renderCell: (params: any) => (
          <Chip
            label={params.value?.toUpperCase()}
            color={params.value === "open" ? "warning" : "default"}
            size="small"
          />
        ),
      },
      {
        field: "created_by",
        headerName: t("columns.createdBy"),
        flex: 1,
      },
      {
        field: "created_at",
        headerName: t("columns.date"),
        flex: 1,
        renderCell: (params: any) => {
          const date = new Date(params.row.created_at);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        },
      },
      ...(role === "super_admin"
        ? [{ field: "society_name", headerName: t("columns.society"), flex: 1 }]
        : []),
      ...(role !== "member"
        ? [
            {
              field: "actions",
              headerName: t("columns.actions"),
              flex: 1,
              renderCell: (params: any) => {
                const currentSocietyId = params.row.society_id; // ✅ Always fetch from row
                if (!currentSocietyId) return null;

                return (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={toggling}
                    onClick={() =>
                      toggleStatus({
                        societyId: currentSocietyId,
                        noticeId: params.row.id,
                      })
                    }
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    {params.row.status === "open"
                      ? t("buttons.close")
                      : t("buttons.reopen")}
                  </Button>
                );
              },
            },
          ]
        : []),
    ];
  }, [t, toggling, toggleStatus, role]);

  return (
    <Box height="calc(100vh - 180px)">
      {/* ✅ Top Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddModal(true)}
            sx={{
              borderRadius: 1,
              border: "1px solid #1e1ee4",
              color: "#1e1ee4",
            }}
          >
            {t("buttons.newNotice")}
          </Button>
        </Box>
      </Box>

      {/* ✅ Notices DataGrid */}
      <CommonDataGrid
        rows={notices}
        columns={columns}
        loading={loadingNotices}
        height="calc(100vh - 180px)"
        pageSize={20}
      />

      {/* ✅ Add Notice Modal */}
      <AddNoticeModal
        open={addModal}
        onClose={() => setAddModal(false)}
        societyId={societyId}
      />
    </Box>
  );
}
