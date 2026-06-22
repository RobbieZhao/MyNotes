"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {
  DATASET_SHAPE_LABELS,
  type DatasetMapping,
  type DatasetShape,
  isTidyMapping,
  isWideSeriesMapping,
  isWideTimeSeriesMapping,
} from "@/lib/datasets/datasetTypes";

interface DatasetSummaryCardProps {
  name: string;
  shape: DatasetShape;
  rowCount: number;
  columnCount: number;
  mapping: DatasetMapping;
}

function describeMapping(mapping: DatasetMapping): string[] {
  if (isWideTimeSeriesMapping(mapping)) {
    return [
      `Entity column: ${mapping.entityColumn}`,
      `Time columns: ${mapping.timeColumns.join(", ")}`,
    ];
  }
  if (isWideSeriesMapping(mapping)) {
    return [
      `Time column: ${mapping.timeColumn}`,
      `Series columns: ${mapping.seriesColumns.join(", ")}`,
    ];
  }
  if (isTidyMapping(mapping)) {
    return [
      mapping.timeColumn ? `Time column: ${mapping.timeColumn}` : "No time column",
      `Dimensions: ${mapping.dimensionColumns.join(", ")}`,
      `Measures: ${mapping.measureColumns.join(", ")}`,
    ];
  }
  return [`Columns: ${mapping.columns.join(", ")}`];
}

export function DatasetSummaryCard({
  name,
  shape,
  rowCount,
  columnCount,
  mapping,
}: DatasetSummaryCardProps) {
  const mappingLines = describeMapping(mapping);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Box sx={{ display: "grid", gap: 1 }}>
          <Typography variant="body2">
            <Box component="span" sx={{ color: "text.secondary" }}>
              Name:
            </Box>{" "}
            {name}
          </Typography>
          <Typography variant="body2">
            <Box component="span" sx={{ color: "text.secondary" }}>
              Shape:
            </Box>{" "}
            {DATASET_SHAPE_LABELS[shape]}
          </Typography>
          <Typography variant="body2">
            <Box component="span" sx={{ color: "text.secondary" }}>
              Rows:
            </Box>{" "}
            {rowCount.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            <Box component="span" sx={{ color: "text.secondary" }}>
              Columns:
            </Box>{" "}
            {columnCount}
          </Typography>
          {mappingLines.map((line) => (
            <Typography key={line} variant="body2">
              {line}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
