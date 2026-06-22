"use client";

import { useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DatasetManager } from "@/components/datasets/DatasetManager";
import { useDatasets } from "@/contexts/DatasetsContext";
import type { StoredDatasetConfig } from "@/types/dataset";
import type { Dataset } from "@/types/database";

export function DatasetsPageClient() {
  const { datasets, createDataset, updateDatasetConfig, deleteDataset } = useDatasets();

  const handleCreate = useCallback(
    async (name: string, data: Dataset["data"], config: StoredDatasetConfig) => {
      const result = await createDataset(name, data, config);
      return result.dataset;
    },
    [createDataset]
  );

  const handleUpdateConfig = useCallback(
    async (id: string, config: StoredDatasetConfig) => {
      await updateDatasetConfig(id, config);
    },
    [updateDatasetConfig]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteDataset(id);
    },
    [deleteDataset]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 3, overflow: "auto" }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Datasets
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload and manage CSV datasets used by charts, tables, and filters across your documents.
      </Typography>
      <Box sx={{ maxWidth: 720 }}>
        <DatasetManager
          datasets={datasets}
          onCreate={handleCreate}
          onUpdateConfig={handleUpdateConfig}
          onDelete={handleDelete}
        />
      </Box>
    </Box>
  );
}
