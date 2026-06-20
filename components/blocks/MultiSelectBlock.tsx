"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatasetPicker } from "@/components/datasets/DatasetPicker";
import { useGroupRuntime } from "@/contexts/DocumentRuntimeContext";
import { getMultiSelectOptions } from "@/lib/datasets/interpret";
import type { MultiSelectBlockData } from "@/types/blocks";
import { normalizeDatasetConfig } from "@/types/dataset";
import type { Dataset } from "@/types/database";

interface MultiSelectBlockEditorProps {
  data: MultiSelectBlockData;
  onChange: (data: MultiSelectBlockData) => void;
  datasets: Dataset[];
}

export function MultiSelectBlockEditor({
  data,
  onChange,
  datasets,
}: MultiSelectBlockEditorProps) {
  const dataset = datasets.find((d) => d.id === data.datasetId);
  const config = dataset ? normalizeDatasetConfig(dataset.config) : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DatasetPicker
        datasets={datasets}
        value={data.datasetId}
        onChange={(datasetId) => onChange({ ...data, datasetId })}
      />
      <TextField
        label="Field label"
        value={data.label ?? "Select options"}
        onChange={(e) => onChange({ ...data, label: e.target.value })}
        size="small"
        fullWidth
        helperText="Label shown on the multi-select control in preview"
      />
      {dataset && config && (
        <Typography variant="caption" color="text.secondary">
          Options come from dataset layout:{" "}
          {config.layout === "columns_are_series" ? "Columns are series" : "Rows are records"}
          {config.keyColumn ? ` (key: ${config.keyColumn})` : ""}
          {config.column ? ` (category: ${config.column})` : ""}
        </Typography>
      )}
    </Box>
  );
}

export function MultiSelectBlockPreview({
  data,
  datasets,
  groupId,
}: {
  data: MultiSelectBlockData;
  datasets: Dataset[];
  groupId?: string | null;
}) {
  const { selectedValues, setSelectedValues } = useGroupRuntime(groupId);
  const dataset = datasets.find((d) => d.id === data.datasetId);

  if (!dataset) return null;

  const config = normalizeDatasetConfig(dataset.config);
  const options = getMultiSelectOptions(dataset.data, config);
  const isReady =
    config.layout === "columns_are_series"
      ? Boolean(config.keyColumn || options.length > 0)
      : Boolean(config.column);

  if (!isReady) return null;

  const fieldLabel = data.label?.trim() || "Select options";

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedValues(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{fieldLabel}</InputLabel>
      <Select
        multiple
        value={selectedValues}
        onChange={handleChange}
        input={<OutlinedInput label={fieldLabel} />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} size="small" />
            ))}
          </Box>
        )}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/** @deprecated Use MultiSelectBlockEditor */
export const CountrySelectorBlockEditor = MultiSelectBlockEditor;
/** @deprecated Use MultiSelectBlockPreview */
export const CountrySelectorBlockPreview = MultiSelectBlockPreview;
