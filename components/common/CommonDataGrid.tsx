"use client";

import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useState } from "react";

type CommonDataGridProps = {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  emptyText?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  height?: number | string;
};
export default function CommonDataGrid({
  rows,
  columns,
  loading = false,
  emptyText = "No records found.",
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  height = "600px", // Now string-based for flexibility (e.g., '100vh' or 'calc(100vh - 200px)')
}: CommonDataGridProps) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSize,
  });

  if (!loading && rows.length === 0) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        sx={{ p: 3 }}
      >
        {emptyText}
      </Typography>
    );
  }

  // Auto add fake id if missing
  const rowsWithId = rows.map((row, index) => ({
    id: row.id ?? `${index}-${row.name ?? "row"}`,
    ...row,
  }));

  return (
    <Box sx={{ height, width: "100%" }}>
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{
          borderRadius: 2,
          bgcolor: "background.paper",
          "& .MuiDataGrid-main": {
            borderRadius: 2,
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#f5f5f5",
            borderRadius: "8px 8px 0 0",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e0e0e0",
            bgcolor: "#fafafa",
          },
        }}
      />
    </Box>
  );
}
