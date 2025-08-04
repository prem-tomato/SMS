"use client";

import CommonDataGrid from "@/components/common/CommonDataGrid";
import AddHousingUnitModal from "@/components/housing/AddHousingUnitModal";
import { fetchAllHousingUnits } from "@/services/housing";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function HousingUnitsPage() {
  const [open, setOpen] = useState(false);

  const {
    data: housingUnits = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["housing-units"],
    queryFn: fetchAllHousingUnits,
  });

  const columns = useMemo(
    () => [
      { field: "unit_number", headerName: "Unit Number", flex: 1 },
      { field: "unit_type", headerName: "Unit Type", flex: 1 },
      { field: "square_foot", headerName: "Sq. Ft", flex: 1 },
      { field: "current_maintenance", headerName: "Maintenance (₹)", flex: 1 },
    ],
    []
  );

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Box height="calc(100vh - 180px)">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              borderRadius: 1,
              border: "1px solid #1e1ee4",
              color: "#1e1ee4",
            }}
          >
            Add Housing Unit
          </Button>
        </Box>

        <CommonDataGrid
          rows={housingUnits}
          columns={columns}
          loading={isLoading}
          height="calc(100vh - 180px)"
          pageSize={20}
        />

        <AddHousingUnitModal open={open} onClose={() => setOpen(false)} />
      </Box>
    </>
  );
}
