"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DatasetNameField } from "@/components/datasets/DatasetNameField";
import { DatasetPreviewTable } from "@/components/datasets/DatasetPreviewTable";
import { DatasetShapeCard } from "@/components/datasets/DatasetShapeCard";
import { useDatasets } from "@/contexts/DatasetsContext";
import {
  DATASET_SHAPE_LABELS,
  isImportedDatasetConfig,
  isTidyMapping,
  isWideSeriesMapping,
  isWideTimeSeriesMapping,
} from "@/lib/datasets/datasetTypes";
import {
  describeStoredDatasetConfig,
  getStoredConfigShape,
} from "@/types/dataset";
import type { Dataset } from "@/types/database";

interface DatasetDetailClientProps {
  dataset: Dataset;
}

function renderMappingDetails(dataset: Dataset) {
  if (!isImportedDatasetConfig(dataset.config)) {
    return (
      <Typography variant="body2" color="text.secondary">
        Legacy dataset configuration: {describeStoredDatasetConfig(dataset.config)}
      </Typography>
    );
  }

  const { mapping } = dataset.config;

  if (isWideTimeSeriesMapping(mapping)) {
    return (
      <>
        <Typography variant="body2">Entity column: {mapping.entityColumn}</Typography>
        <Typography variant="body2">Time columns: {mapping.timeColumns.join(", ")}</Typography>
      </>
    );
  }

  if (isWideSeriesMapping(mapping)) {
    return (
      <>
        <Typography variant="body2">Time column: {mapping.timeColumn}</Typography>
        <Typography variant="body2">Series columns: {mapping.seriesColumns.join(", ")}</Typography>
      </>
    );
  }

  if (isTidyMapping(mapping)) {
    return (
      <>
        {mapping.timeColumn && (
          <Typography variant="body2">Time column: {mapping.timeColumn}</Typography>
        )}
        <Typography variant="body2">
          Dimension columns: {mapping.dimensionColumns.join(", ")}
        </Typography>
        <Typography variant="body2">
          Measure columns: {mapping.measureColumns.join(", ")}
        </Typography>
      </>
    );
  }

  return <Typography variant="body2">Columns: {mapping.columns.join(", ")}</Typography>;
}

export function DatasetDetailClient({ dataset: initialDataset }: DatasetDetailClientProps) {
  const { getDatasetById, updateDatasetName } = useDatasets();
  const dataset = getDatasetById(initialDataset.id) ?? initialDataset;

  const shape = getStoredConfigShape(dataset.config);
  const rowCount = isImportedDatasetConfig(dataset.config)
    ? dataset.config.rowCount
    : dataset.data.length;
  const columnCount = isImportedDatasetConfig(dataset.config)
    ? dataset.config.columnCount
    : dataset.data.length > 0
      ? Object.keys(dataset.data[0]).length
      : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Box>
          <Button
            component={Link}
            href="/datasets"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 1 }}
          >
            Back to datasets
          </Button>
          <DatasetNameField
            value={dataset.name}
            onSave={(name) => updateDatasetName(dataset.id, name)}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Created {new Date(dataset.created_at).toLocaleString()}
          </Typography>
        </Box>
        {shape && <Chip label={DATASET_SHAPE_LABELS[shape]} color="primary" />}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Rows
            </Typography>
            <Typography variant="h4">{rowCount.toLocaleString()}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Columns
            </Typography>
            <Typography variant="h4">{columnCount}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Shape
            </Typography>
            <Typography variant="h6">
              {shape ? DATASET_SHAPE_LABELS[shape] : describeStoredDatasetConfig(dataset.config)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mapping
          </Typography>
          <Box sx={{ display: "grid", gap: 0.5 }}>{renderMappingDetails(dataset)}</Box>
        </CardContent>
      </Card>

      {isImportedDatasetConfig(dataset.config) && (
        <DatasetShapeCard
          shape={dataset.config.shape}
          confidence={1}
          columns={dataset.config.columns}
        />
      )}

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Data preview
        </Typography>
        <DatasetPreviewTable rows={dataset.data} />
      </Box>
    </Box>
  );
}
