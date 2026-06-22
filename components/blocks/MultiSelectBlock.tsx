"use client";

import { useId } from "react";
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
import { describeDatasetLayout, DataLayout, normalizeDatasetConfig } from "@/types/dataset";
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
        value={data.label ?? ""}
        onChange={(e) => onChange({ ...data, label: e.target.value })}
        size="small"
        fullWidth
        placeholder="Optional"
        helperText="Optional label shown on the multi-select in preview"
      />
      {dataset && config && (
        <Typography variant="caption" color="text.secondary">
          Options come from dataset layout: {describeDatasetLayout(config)}
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
  const labelId = useId();
  const dataset = datasets.find((d) => d.id === data.datasetId);

  if (!dataset) return null;

  const config = normalizeDatasetConfig(dataset.config);
  const options = getMultiSelectOptions(dataset.data, config);
  const isReady =
    config.layout === DataLayout.RowsAreRecords
      ? Boolean(config.column)
      : Boolean(config.keyColumn || options.length > 0);

  if (!isReady) return null;

  const fieldLabel = data.label?.trim();
  const hasLabel = Boolean(fieldLabel);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedValues(typeof value === "string" ? value.split(",") : value);
  };

  const renderValue = (selected: string[]) => {
    if (selected.length === 0) {
      return (
        <Box component="span" sx={{ color: "text.disabled" }}>
          Optional
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {selected.map((value) => (
          <Chip key={value} label={value} size="small" />
        ))}
      </Box>
    );
  };

  return (
    <FormControl fullWidth size="small" variant="outlined">
      {hasLabel && (
        <InputLabel id={labelId} shrink>
          {fieldLabel}
        </InputLabel>
      )}
      <Select
        multiple
        displayEmpty
        labelId={hasLabel ? labelId : undefined}
        label={hasLabel ? fieldLabel : undefined}
        value={selectedValues}
        onChange={handleChange}
        input={hasLabel ? <OutlinedInput label={fieldLabel} /> : <OutlinedInput />}
        renderValue={renderValue}
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
