"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { getDatasetColumns } from "@/lib/datasets/csv";
import type { Dataset } from "@/types/database";

interface ColumnPickerProps {
  datasets: Dataset[];
  datasetId: string;
  value: string;
  onChange: (column: string) => void;
  label?: string;
  /** Override column list instead of reading all columns from the dataset. */
  columns?: string[];
}

export function ColumnPicker({
  datasets,
  datasetId,
  value,
  onChange,
  label = "Column",
  columns: columnsOverride,
}: ColumnPickerProps) {
  const dataset = datasets.find((d) => d.id === datasetId);
  const columns =
    columnsOverride ??
    (dataset ? getDatasetColumns(dataset.data) : []);

  return (
    <FormControl fullWidth size="small" disabled={!datasetId}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <MenuItem value="">
          <em>Select column</em>
        </MenuItem>
        {columns.map((col) => (
          <MenuItem key={col} value={col}>
            {col}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
