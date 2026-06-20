"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DatasetManager } from "@/components/datasets/DatasetManager";
import { useDatasets } from "@/contexts/DatasetsContext";

export function DatasetsPageClient() {
  const { datasets, createDataset, updateDatasetConfig, deleteDataset } = useDatasets();

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
          onCreate={createDataset}
          onUpdateConfig={updateDatasetConfig}
          onDelete={deleteDataset}
        />
      </Box>
    </Box>
  );
}
