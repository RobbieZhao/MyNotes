"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { getAvailableTimeKeys } from "@/lib/datasets/interpret";
import type { Dataset } from "@/types/database";
import { normalizeDatasetConfig } from "@/types/dataset";

interface YearPickerProps {
  datasets: Dataset[];
  datasetId: string;
  keyColumn?: string;
  value: number | undefined;
  onChange: (year: number) => void;
  label?: string;
}

export function YearPicker({
  datasets,
  datasetId,
  keyColumn,
  value,
  onChange,
  label = "Slice year",
}: YearPickerProps) {
  const dataset = datasets.find((d) => d.id === datasetId);
  const config = dataset ? normalizeDatasetConfig(dataset.config) : null;
  const years =
    dataset && config ? getAvailableTimeKeys(dataset.data, config) : [];

  const ready = Boolean(datasetId && config && years.length > 0);

  return (
    <FormControl fullWidth size="small" disabled={!ready}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <MenuItem value="">
          <em>Select year</em>
        </MenuItem>
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
