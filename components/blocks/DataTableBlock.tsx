"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ClientOnly } from "@/components/ClientOnly";
import { DatasetPicker } from "@/components/datasets/DatasetPicker";
import { getDatasetColumns } from "@/lib/datasets/csv";
import type { DataTableBlockData } from "@/types/blocks";
import type { Dataset } from "@/types/database";

interface DataTableBlockEditorProps {
  data: DataTableBlockData;
  onChange: (data: DataTableBlockData) => void;
  datasets: Dataset[];
}

export function DataTableBlockEditor({
  data,
  onChange,
  datasets,
}: DataTableBlockEditorProps) {
  return (
    <DatasetPicker
      datasets={datasets}
      value={data.datasetId}
      onChange={(datasetId) => onChange({ datasetId })}
    />
  );
}

export function DataTableBlockPreview({
  data,
  datasets,
}: {
  data: DataTableBlockData;
  datasets: Dataset[];
}) {
  const dataset = datasets.find((d) => d.id === data.datasetId);

  const columns: GridColDef[] = useMemo(() => {
    if (!dataset) return [];
    return getDatasetColumns(dataset.data).map((col) => ({
      field: col,
      headerName: col,
      flex: 1,
      minWidth: 100,
    }));
  }, [dataset]);

  const rows = useMemo(() => {
    if (!dataset) return [];
    return dataset.data.map((row, index) => ({ id: index, ...row }));
  }, [dataset]);

  if (!dataset) return null;

  return (
    <ClientOnly
      fallback={
        <Box sx={{ height: 300, width: "100%", bgcolor: "action.hover", borderRadius: 1 }} />
      }
    >
      <Box sx={{ height: 300, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          disableRowSelectionOnClick
        />
      </Box>
    </ClientOnly>
  );
}
