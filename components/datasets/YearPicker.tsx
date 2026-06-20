"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { getKeyColumnValues } from "@/lib/datasets/interpret";
import type { Dataset } from "@/types/database";
import { normalizeDatasetConfig } from "@/types/dataset";

interface YearPickerProps {
  datasets: Dataset[];
  datasetId: string;
  keyColumn: string;
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
  const effectiveKey = keyColumn || config?.keyColumn || "";
  const years =
    dataset && effectiveKey ? getKeyColumnValues(dataset.data, effectiveKey) : [];

  return (
    <FormControl fullWidth size="small" disabled={!datasetId || !effectiveKey}>
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
