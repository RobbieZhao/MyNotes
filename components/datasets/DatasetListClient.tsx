"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ClientOnly } from "@/components/ClientOnly";
import { DatasetRenameDialog } from "@/components/datasets/DatasetRenameDialog";
import { useDatasets } from "@/contexts/DatasetsContext";
import { DATASET_SHAPE_LABELS } from "@/lib/datasets/datasetTypes";
import {
  describeStoredDatasetConfig,
  getStoredConfigShape,
  isImportedDatasetConfig,
} from "@/types/dataset";
import type { Dataset } from "@/types/database";

function getDatasetRowCount(dataset: Dataset): number {
  if (isImportedDatasetConfig(dataset.config)) return dataset.config.rowCount;
  return dataset.data.length;
}

function getDatasetColumnCount(dataset: Dataset): number {
  if (isImportedDatasetConfig(dataset.config)) return dataset.config.columnCount;
  if (dataset.data.length === 0) return 0;
  return Object.keys(dataset.data[0]).length;
}

function getDatasetShapeLabel(dataset: Dataset): string {
  const shape = getStoredConfigShape(dataset.config);
  if (shape) return DATASET_SHAPE_LABELS[shape];
  return describeStoredDatasetConfig(dataset.config);
}

export function DatasetListClient() {
  const router = useRouter();
  const { datasets, deleteDataset, updateDatasetName } = useDatasets();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingDataset, setRenamingDataset] = useState<Dataset | null>(null);
  const [renaming, setRenaming] = useState(false);

  const rows = useMemo(
    () =>
      datasets.map((dataset) => ({
        id: dataset.id,
        name: dataset.name,
        shape: getDatasetShapeLabel(dataset),
        rows: getDatasetRowCount(dataset),
        columns: getDatasetColumnCount(dataset),
        createdAt: new Date(dataset.created_at).toLocaleString(),
        dataset,
      })),
    [datasets]
  );

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1.2, minWidth: 180 },
    { field: "shape", headerName: "Shape", flex: 1, minWidth: 160 },
    {
      field: "rows",
      headerName: "Rows",
      type: "number",
      width: 100,
      valueFormatter: (value) => Number(value).toLocaleString(),
    },
    { field: "columns", headerName: "Columns", type: "number", width: 110 },
    { field: "createdAt", headerName: "Created At", flex: 1, minWidth: 180 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            aria-label="View dataset"
            onClick={() => router.push(`/datasets/${params.row.id}`)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Rename dataset"
            onClick={() => setRenamingDataset(params.row.dataset)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Delete dataset"
            disabled={deletingId === params.row.id}
            onClick={async () => {
              setError(null);
              setDeletingId(params.row.id);
              const deleteError = await deleteDataset(params.row.id);
              setDeletingId(null);
              if (deleteError) setError(deleteError);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%", minHeight: 0, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Datasets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse saved datasets used by charts, tables, and filters.
          </Typography>
        </Box>
        <Button component={Link} href="/datasets/import" variant="contained" startIcon={<AddIcon />}>
          Import dataset
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {datasets.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
            p: 4,
          }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 420 }}>
            <Typography variant="h6" gutterBottom>
              No datasets yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Import a CSV file to create your first dataset.
            </Typography>
            <Button component={Link} href="/datasets/import" variant="contained">
              Import CSV
            </Button>
          </Box>
        </Box>
      ) : (
        <ClientOnly
          fallback={
            <Box sx={{ flex: 1, bgcolor: "action.hover", borderRadius: 1, minHeight: 400 }} />
          }
        >
          <Box sx={{ flex: 1, minHeight: 400 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            />
          </Box>
        </ClientOnly>
      )}

      <DatasetRenameDialog
        open={renamingDataset !== null}
        initialName={renamingDataset?.name ?? ""}
        saving={renaming}
        onClose={() => setRenamingDataset(null)}
        onSave={async (name) => {
          if (!renamingDataset) return "No dataset selected.";
          setRenaming(true);
          const saveError = await updateDatasetName(renamingDataset.id, name);
          setRenaming(false);
          return saveError;
        }}
      />
    </Box>
  );
}
