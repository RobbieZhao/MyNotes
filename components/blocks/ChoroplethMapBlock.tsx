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
import { ChoroplethMap } from "@/components/charts/ChoroplethMap";
import { ColumnPicker } from "@/components/datasets/ColumnPicker";
import { DatasetPicker } from "@/components/datasets/DatasetPicker";
import { YearPicker } from "@/components/datasets/YearPicker";
import { PIE_VALUE_SCALE_LABELS, type PieValueScale } from "@/lib/d3/format";
import { getChoroplethFrames, getChoroplethRegions } from "@/lib/datasets/interpret";
import type { ChoroplethColorScheme, ChoroplethMapBlockData, MapRegion } from "@/types/blocks";
import { DataLayout, describeDatasetLayout, isWideTimeLayout, normalizeDatasetConfig } from "@/types/dataset";
import type { Dataset } from "@/types/database";
import { useGroupRuntime } from "@/contexts/DocumentRuntimeContext";

const MAP_REGION_LABELS: Record<MapRegion, string> = {
  world: "World (countries)",
  usa: "United States (states)",
};

const COLOR_SCHEME_LABELS: Record<ChoroplethColorScheme, string> = {
  blues: "Ocean blues",
  teal: "Teal gradient",
  orange: "Warm orange",
  purple: "Royal purple",
  viridis: "Viridis",
};

interface ChoroplethMapBlockEditorProps {
  data: ChoroplethMapBlockData;
  onChange: (data: ChoroplethMapBlockData) => void;
  datasets: Dataset[];
}

export function ChoroplethMapBlockEditor({
  data,
  onChange,
  datasets,
}: ChoroplethMapBlockEditorProps) {
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
          Uses dataset layout: {describeDatasetLayout(config)}
        </Typography>
      )}
      {config && isWideTimeLayout(config.layout) && (
        <YearPicker
          datasets={datasets}
          datasetId={data.datasetId}
          value={data.sliceYear}
          onChange={(sliceYear) => onChange({ ...data, sliceYear })}
        />
      )}
      {config?.layout === DataLayout.RowsAreRecords && (
        <>
          <ColumnPicker
            datasets={datasets}
            datasetId={data.datasetId}
            value={data.labelColumn ?? ""}
            onChange={(labelColumn) => onChange({ ...data, labelColumn })}
            label="Region column"
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
        Map appearance
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel>Map region</InputLabel>
        <Select
          label="Map region"
          value={data.mapRegion ?? "world"}
          onChange={(e) => onChange({ ...data, mapRegion: e.target.value as MapRegion })}
        >
          {(Object.keys(MAP_REGION_LABELS) as MapRegion[]).map((region) => (
            <MenuItem key={region} value={region}>
              {MAP_REGION_LABELS[region]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {data.mapRegion === "usa" && (
        <Typography variant="caption" color="text.secondary">
          Region columns should use state names (e.g. California) or abbreviations (e.g. CA).
        </Typography>
      )}
      <TextField
        label="Title"
        value={data.title ?? ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        size="small"
        fullWidth
      />
      <FormControl fullWidth size="small">
        <InputLabel>Color scheme</InputLabel>
        <Select
          label="Color scheme"
          value={data.colorScheme ?? "blues"}
          onChange={(e) =>
            onChange({ ...data, colorScheme: e.target.value as ChoroplethColorScheme })
          }
        >
          {(Object.keys(COLOR_SCHEME_LABELS) as ChoroplethColorScheme[]).map((scheme) => (
            <MenuItem key={scheme} value={scheme}>
              {COLOR_SCHEME_LABELS[scheme]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
        label="Show color legend"
      />
      {config && isWideTimeLayout(config.layout) && (
        <FormControlLabel
          control={
            <Switch
              checked={data.enableAnimation !== false}
              onChange={(e) => onChange({ ...data, enableAnimation: e.target.checked })}
            />
          }
          label="Animate over time (when not linked to line chart)"
        />
      )}
    </Box>
  );
}

export function ChoroplethMapBlockPreview({
  data,
  datasets,
  groupId,
}: {
  data: ChoroplethMapBlockData;
  datasets: Dataset[];
  groupId?: string | null;
}) {
  const { selectedValues, selectedX } = useGroupRuntime(groupId);
  const dataset = datasets.find((d) => d.id === data.datasetId);
  if (!dataset) return null;

  const config = normalizeDatasetConfig(dataset.config);
  const sliceYear =
    groupId && selectedX !== null ? selectedX : data.sliceYear;

  const selectedSeries = selectedValues.length ? selectedValues : undefined;

  const regions = getChoroplethRegions(dataset.data, config, data, {
    sliceYear,
    selectedSeries,
  });

  const { frames, keyLabel } = getChoroplethFrames(
    dataset.data,
    config,
    data,
    selectedSeries
  );

  const useAnimation =
    data.enableAnimation !== false &&
    !(groupId && selectedX !== null) &&
    isWideTimeLayout(config.layout) &&
    sliceYear === undefined;

  return (
    <ChoroplethMap
      regions={regions}
      frames={useAnimation ? frames : []}
      mapRegion={data.mapRegion ?? "world"}
      keyLabel={keyLabel}
      title={data.title}
      valueScale={data.valueScale ?? "auto"}
      showLegend={data.showLegend !== false}
      colorScheme={data.colorScheme ?? "blues"}
      enableAnimation={useAnimation}
      highlightedLabels={selectedSeries ?? []}
    />
  );
}
