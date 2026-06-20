"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DatasetManager } from "@/components/datasets/DatasetManager";
import { DatasetPicker } from "@/components/datasets/DatasetPicker";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";
import type { DatasetBlockData } from "@/types/blocks";
import { DATA_LAYOUT_LABELS } from "@/types/dataset";
import { normalizeDatasetConfig } from "@/types/dataset";
import type { Dataset } from "@/types/database";

interface DatasetBlockEditorProps {
  data: DatasetBlockData;
  onChange: (data: DatasetBlockData) => void;
  datasets: Dataset[];
}

export function DatasetBlockEditor({ data, onChange, datasets }: DatasetBlockEditorProps) {
  const { createDataset, updateDatasetConfig, deleteDataset } = useDocumentEditor();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DatasetPicker
        datasets={datasets}
        value={data.datasetId}
        onChange={(datasetId) => onChange({ datasetId })}
      />
      <DatasetManager
        datasets={datasets}
        onCreate={createDataset}
        onUpdateConfig={updateDatasetConfig}
        onDelete={deleteDataset}
      />
    </Box>
  );
}

export function DatasetBlockPreview({
  data,
  datasets,
}: {
  data: DatasetBlockData;
  datasets: Dataset[];
}) {
  const dataset = datasets.find((d) => d.id === data.datasetId);
  if (!dataset) return null;

  const config = normalizeDatasetConfig(dataset.config);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {dataset.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {dataset.data.length} rows · {DATA_LAYOUT_LABELS[config.layout]}
        {config.keyColumn ? ` · key: ${config.keyColumn}` : ""}
        {config.column ? ` · category: ${config.column}` : ""}
      </Typography>
    </Box>
  );
}
