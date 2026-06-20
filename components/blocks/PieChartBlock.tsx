"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { PieChart } from "@/components/charts/PieChart";
import { ColumnPicker } from "@/components/datasets/ColumnPicker";
import { DatasetPicker } from "@/components/datasets/DatasetPicker";
import { YearPicker } from "@/components/datasets/YearPicker";
import { PIE_VALUE_SCALE_LABELS, type PieValueScale } from "@/lib/d3/format";
import { getPieChartSlices } from "@/lib/datasets/interpret";
import type { PieChartBlockData } from "@/types/blocks";
import { normalizeDatasetConfig } from "@/types/dataset";
import type { BlockRow, Dataset } from "@/types/database";
import { useGroupRuntime } from "@/contexts/DocumentRuntimeContext";

interface PieChartBlockEditorProps {
  data: PieChartBlockData;
  onChange: (data: PieChartBlockData) => void;
  datasets: Dataset[];
}

export function PieChartBlockEditor({
  data,
  onChange,
  datasets,
}: PieChartBlockEditorProps) {
  const dataset = datasets.find((d) => d.id === data.datasetId);
  const config = dataset ? normalizeDatasetConfig(dataset.config) : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DatasetPicker
        datasets={datasets}
        value={data.datasetId}
        onChange={(datasetId) =>
          onChange({
            datasetId,
            sliceYear: undefined,
            labelColumn: "",
            valueColumn: "",
          })
        }
      />
      {config && (
        <Typography variant="caption" color="text.secondary">
          Uses dataset layout:{" "}
          {config.layout === "columns_are_series" ? "Columns are series" : "Rows are records"}
          {config.keyColumn ? ` (key: ${config.keyColumn})` : ""}
        </Typography>
      )}
      {config?.layout === "columns_are_series" && (
        <YearPicker
          datasets={datasets}
          datasetId={data.datasetId}
          keyColumn={config.keyColumn ?? ""}
          value={data.sliceYear}
          onChange={(sliceYear) => onChange({ ...data, sliceYear })}
        />
      )}
      {config?.layout === "rows_are_records" && (
        <>
          <ColumnPicker
            datasets={datasets}
            datasetId={data.datasetId}
            value={data.labelColumn ?? ""}
            onChange={(labelColumn) => onChange({ ...data, labelColumn })}
            label="Label column"
          />
          <ColumnPicker
            datasets={datasets}
            datasetId={data.datasetId}
            value={data.valueColumn ?? ""}
            onChange={(valueColumn) => onChange({ ...data, valueColumn })}
            label="Value column"
          />
        </>
      )}

      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        Chart appearance
      </Typography>
      <TextField
        label="Title"
        value={data.title ?? ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        size="small"
        fullWidth
      />
      <FormControl fullWidth size="small">
        <InputLabel>Value scale</InputLabel>
        <Select
          label="Value scale"
          value={data.valueScale ?? "auto"}
          onChange={(e) => onChange({ ...data, valueScale: e.target.value as PieValueScale })}
        >
          {(Object.keys(PIE_VALUE_SCALE_LABELS) as PieValueScale[]).map((scale) => (
            <MenuItem key={scale} value={scale}>
              {PIE_VALUE_SCALE_LABELS[scale]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={data.showLegend !== false}
            onChange={(e) => onChange({ ...data, showLegend: e.target.checked })}
          />
        }
        label="Show legend"
      />
      <FormControlLabel
        control={
          <Switch
            checked={data.showLabels !== false}
            onChange={(e) => onChange({ ...data, showLabels: e.target.checked })}
          />
        }
        label="Show percentages on slices"
      />
    </Box>
  );
}

export function PieChartBlockPreview({
  data,
  datasets,
  groupId,
}: {
  data: PieChartBlockData;
  datasets: Dataset[];
  groupId?: string | null;
}) {
  const { selectedValues, selectedX } = useGroupRuntime(groupId);
  const dataset = datasets.find((d) => d.id === data.datasetId);
  if (!dataset) return null;

  const config = normalizeDatasetConfig(dataset.config);
  const sliceYear =
    groupId && selectedX !== null ? selectedX : data.sliceYear;

  const slices = getPieChartSlices(dataset.data, config, data, {
    sliceYear,
    selectedSeries: selectedValues.length ? selectedValues : undefined,
  });

  const waitingForLineClick =
    groupId && selectedX === null && config.layout === "columns_are_series";

  const linkedHint =
    groupId && selectedX !== null
      ? `Showing breakdown at ${config.keyColumn ?? "X"} = ${selectedX}`
      : waitingForLineClick
        ? "Click a point on the line chart in this group to pick a slice"
        : undefined;

  return (
    <PieChart
      slices={slices}
      title={data.title}
      valueScale={data.valueScale ?? "auto"}
      showLegend={data.showLegend !== false}
      showLabels={data.showLabels !== false}
      subtitle={linkedHint}
    />
  );
}
