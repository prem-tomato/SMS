"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddNoticeModal from "@/components/notices/AddNoticeModal";
import { fetchNotices, toggleNoticeStatus } from "@/services/notices";
import { fetchSocietyOptions } from "@/services/societies";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function NoticesPage() {
  const [societyId, setSocietyId] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const queryClient = useQueryClient();

  const { data: societies = [], isLoading: loadingSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: fetchSocietyOptions,
  });

  const { data: notices = [], isLoading: loadingNotices } = useQuery({
    queryKey: ["notices", societyId],
    queryFn: () => fetchNotices(societyId),
    enabled: !!societyId,
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
      queryClient.invalidateQueries({ queryKey: ["notices", societyId] });
    },
  });

  const columns = useMemo(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "content",
        headerName: "Content",
        flex: 2,
        minWidth: 300,
      },
      {
        field: "status",
        headerName: "Status",
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
        headerName: "Created By",
        flex: 1,
      },
      {
        field: "created_at",
        headerName: "Date",
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
      
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        renderCell: (params: any) =>
          societyId ? (
            <Button
              size="small"
              variant="outlined"
              disabled={toggling}
              onClick={() =>
                toggleStatus({ societyId, noticeId: params.row.id })
              }
              sx={{ textTransform: "none", fontSize: "0.75rem" }}
            >
              {params.row.status === "open" ? "Close" : "Re-Open"}
            </Button>
          ) : null,
      },
    ],
    [societyId, toggling]
  );

  return (
    <Container maxWidth="xl">
      {/* ✅ Top Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" gap={1}>
          {societyId && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddModal(true)}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                px: 2,
                py: 0.8,
                borderRadius: 2,
              }}
            >
              New Notice
            </Button>
          )}
          <IconButton
            sx={{
              p: 1,
              borderRadius: 2,
              border: "1px solid #1e1ee4",
              color: "#1e1ee4",
            }}
            onClick={() => setFilterOpen(true)}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ✅ Notices DataGrid */}
      {societyId ? (
        <CommonDataGrid
          rows={notices}
          columns={columns}
          loading={loadingNotices}
        />
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Please select a Society from filters ➡️
        </Typography>
      )}

      {/* ✅ Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* ✅ Society Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Society</InputLabel>
            <Select
              value={societyId}
              label="Society"
              onChange={(e) => setSocietyId(e.target.value)}
            >
              {loadingSocieties ? (
                <MenuItem disabled>Loading societies...</MenuItem>
              ) : (
                societies.map((society: any) => (
                  <MenuItem key={society.id} value={society.id}>
                    {society.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setFilterOpen(false)}
            disabled={!societyId}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* ✅ Add Notice Modal */}
      <AddNoticeModal
        open={addModal}
        onClose={() => setAddModal(false)}
        societyId={societyId}
      />
    </Container>
  );
}
