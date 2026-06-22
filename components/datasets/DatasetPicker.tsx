"use client";

import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import Link from "next/link";
import type { Dataset } from "@/types/database";

interface DatasetPickerProps {
  datasets: Dataset[];
  value: string;
  onChange: (datasetId: string) => void;
  label?: string;
}

export function DatasetPicker({
  datasets,
  value,
  onChange,
  label = "Dataset",
}: DatasetPickerProps) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">
          <em>Select a dataset</em>
        </MenuItem>
        {datasets.map((dataset) => (
          <MenuItem key={dataset.id} value={dataset.id}>
            {dataset.name}
          </MenuItem>
        ))}
        <Divider sx={{ my: 0.5 }} />
        <ListSubheader disableSticky sx={{ lineHeight: "32px", fontSize: 12 }}>
          Need a new dataset?
        </ListSubheader>
        <MenuItem
          component={Link}
          href="/datasets/import"
          sx={{ gap: 1, color: "primary.main" }}
        >
          <StorageOutlinedIcon sx={{ fontSize: 18 }} />
          Manage datasets…
        </MenuItem>
      </Select>
    </FormControl>
  );
}
