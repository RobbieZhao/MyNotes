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
import { BarChartRace } from "@/components/charts/BarChartRace";
import { ColumnPicker } from "@/components/datasets/ColumnPicker";
import { DatasetPicker } from "@/components/datasets/DatasetPicker";
import { PIE_VALUE_SCALE_LABELS, type PieValueScale } from "@/lib/d3/format";
import { getBarChartRaceFrames } from "@/lib/datasets/interpret";
import type { BarChartRaceBlockData, BarOrientation } from "@/types/blocks";
import { DataLayout, describeDatasetLayout, normalizeDatasetConfig } from "@/types/dataset";
import type { Dataset } from "@/types/database";
import { useGroupRuntime } from "@/contexts/DocumentRuntimeContext";

interface BarChartRaceBlockEditorProps {
  data: BarChartRaceBlockData;
  onChange: (data: BarChartRaceBlockData) => void;
  datasets: Dataset[];
}

export function BarChartRaceBlockEditor({
  data,
  onChange,
  datasets,
}: BarChartRaceBlockEditorProps) {
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
            labelColumn: "",
            valueColumn: "",
          })
        }
      />
      {config && (
        <Typography variant="caption" color="text.secondary">
          Uses dataset layout: {describeDatasetLayout(config)}
        </Typography>
      )}
      {config?.layout === DataLayout.RowsAreRecords && (
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
        <InputLabel>Orientation</InputLabel>
        <Select
          label="Orientation"
          value={data.orientation ?? "horizontal"}
          onChange={(e) => onChange({ ...data, orientation: e.target.value as BarOrientation })}
        >
          <MenuItem value="horizontal">Horizontal</MenuItem>
          <MenuItem value="vertical">Vertical</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Max bars shown"
        type="number"
        value={data.maxBars ?? 10}
        onChange={(e) =>
          onChange({ ...data, maxBars: Math.max(1, Number(e.target.value) || 10) })
        }
        size="small"
        fullWidth
        slotProps={{ htmlInput: { min: 1, max: 30 } }}
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
            checked={data.showValues !== false}
            onChange={(e) => onChange({ ...data, showValues: e.target.checked })}
          />
        }
        label="Show values on bars"
      />
    </Box>
  );
}

export function BarChartRaceBlockPreview({
  data,
  datasets,
  groupId,
}: {
  data: BarChartRaceBlockData;
  datasets: Dataset[];
  groupId?: string | null;
}) {
  const { selectedValues } = useGroupRuntime(groupId);
  const dataset = datasets.find((d) => d.id === data.datasetId);
  if (!dataset) return null;

  const config = normalizeDatasetConfig(dataset.config);
  const { frames, keyLabel, valueLabel } = getBarChartRaceFrames(
    dataset.data,
    config,
    data,
    selectedValues.length ? selectedValues : undefined
  );

  return (
    <BarChartRace
      frames={frames}
      title={data.title}
      keyLabel={keyLabel}
      valueLabel={valueLabel}
      valueScale={data.valueScale ?? "auto"}
      orientation={data.orientation ?? "horizontal"}
      maxBars={data.maxBars ?? 10}
      showValues={data.showValues !== false}
    />
  );
}
