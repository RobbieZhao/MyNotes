"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ClientOnly } from "@/components/ClientOnly";
import { getDatasetColumns } from "@/lib/datasets/datasetTypes";

interface DatasetPreviewTableProps {
  rows: Record<string, unknown>[];
  maxRows?: number;
  height?: number;
}

export function DatasetPreviewTable({
  rows,
  maxRows = 100,
  height = 420,
}: DatasetPreviewTableProps) {
  const previewRows = useMemo(() => rows.slice(0, maxRows), [rows, maxRows]);

  const columns: GridColDef[] = useMemo(() => {
    return getDatasetColumns(rows).map((column) => ({
      field: column,
      headerName: column,
      flex: 1,
      minWidth: 120,
    }));
  }, [rows]);

  const gridRows = useMemo(
    () => previewRows.map((row, index) => ({ id: index, ...row })),
    [previewRows]
  );

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No rows to preview.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Showing {Math.min(rows.length, maxRows).toLocaleString()} of {rows.length.toLocaleString()} rows
        · {columns.length} columns
      </Typography>
      <ClientOnly
        fallback={
          <Box sx={{ height, width: "100%", bgcolor: "action.hover", borderRadius: 1 }} />
        }
      >
        <Box sx={{ height, width: "100%" }}>
          <DataGrid
            rows={gridRows}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            density="compact"
          />
        </Box>
      </ClientOnly>
    </Box>
  );
}
