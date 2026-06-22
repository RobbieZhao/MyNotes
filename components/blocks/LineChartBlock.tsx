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
import { LineChart } from "@/components/charts/LineChart";
import { ColumnPicker } from "@/components/datasets/ColumnPicker";
import { DatasetPicker } from "@/components/datasets/DatasetPicker";
import { useGroupRuntime } from "@/contexts/DocumentRuntimeContext";
import { Y_AXIS_SCALE_LABELS } from "@/lib/d3/format";
import { groupHasBlockType } from "@/lib/blocks/outline";
import { getLineChartSeries } from "@/lib/datasets/interpret";
import type { LineChartBlockData, YAxisScale } from "@/types/blocks";
import { DataLayout, describeDatasetLayout, normalizeDatasetConfig } from "@/types/dataset";
import type { BlockRow, Dataset } from "@/types/database";

interface LineChartBlockEditorProps {
  data: LineChartBlockData;
  onChange: (data: LineChartBlockData) => void;
  datasets: Dataset[];
}

export function LineChartBlockEditor({
  data,
  onChange,
  datasets,
}: LineChartBlockEditorProps) {
  const dataset = datasets.find((d) => d.id === data.datasetId);
  const config = dataset ? normalizeDatasetConfig(dataset.config) : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DatasetPicker
        datasets={datasets}
        value={data.datasetId}
        onChange={(datasetId) =>
          onChange({ ...data, datasetId, xColumn: "", yColumn: "" })
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
            value={data.xColumn ?? ""}
            onChange={(xColumn) => onChange({ ...data, xColumn })}
            label="X column"
          />
          <ColumnPicker
            datasets={datasets}
            datasetId={data.datasetId}
            value={data.yColumn ?? ""}
            onChange={(yColumn) => onChange({ ...data, yColumn })}
            label="Y column"
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
      <TextField
        label="X axis label"
        value={data.xAxisLabel ?? ""}
        onChange={(e) => onChange({ ...data, xAxisLabel: e.target.value })}
        size="small"
        fullWidth
        placeholder={config?.keyColumn ?? "Year"}
      />
      <TextField
        label="Y axis label"
        value={data.yAxisLabel ?? ""}
        onChange={(e) => onChange({ ...data, yAxisLabel: e.target.value })}
        size="small"
        fullWidth
        placeholder="GDP"
      />
      <FormControl fullWidth size="small">
        <InputLabel>Y axis scale</InputLabel>
        <Select
          label="Y axis scale"
          value={data.yAxisScale ?? "auto"}
          onChange={(e) => onChange({ ...data, yAxisScale: e.target.value as YAxisScale })}
        >
          {(Object.keys(Y_AXIS_SCALE_LABELS) as YAxisScale[]).map((scale) => (
            <MenuItem key={scale} value={scale}>
              {Y_AXIS_SCALE_LABELS[scale]}
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
    </Box>
  );
}

export function LineChartBlockPreview({
  data,
  datasets,
  block,
  allBlocks,
}: {
  data: LineChartBlockData;
  datasets: Dataset[];
  block: BlockRow;
  allBlocks: BlockRow[];
}) {
  const { selectedValues, selectedX, setSelectedX } = useGroupRuntime(block.group_id);
  const dataset = datasets.find((d) => d.id === data.datasetId);

  if (!dataset) return null;

  const config = normalizeDatasetConfig(dataset.config);
  const { series, xLabel: defaultXLabel, yLabel: defaultYLabel } = getLineChartSeries(
    dataset.data,
    config,
    data,
    selectedValues
  );

  const crosshairEnabled = Boolean(
    block.group_id &&
      groupHasBlockType(allBlocks, block.group_id, "pie_chart")
  );

  return (
    <LineChart
      series={series}
      title={data.title}
      xLabel={data.xAxisLabel || defaultXLabel}
      yLabel={data.yAxisLabel || defaultYLabel}
      yAxisScale={data.yAxisScale ?? "auto"}
      showLegend={data.showLegend !== false}
      crosshair={crosshairEnabled}
      selectedX={crosshairEnabled ? selectedX : null}
      onXSelect={
        crosshairEnabled
          ? (x) => setSelectedX(x, block.id)
          : undefined
      }
    />
  );
}
