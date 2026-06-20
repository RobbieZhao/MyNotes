"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import type { DataLayout, DatasetConfig } from "@/types/dataset";
import { DATA_LAYOUT_LABELS } from "@/types/dataset";

interface LayoutSelectorProps {
  value: DataLayout;
  onChange: (layout: DataLayout) => void;
}

const EXAMPLES: Record<DataLayout, string> = {
  columns_are_series: "Year | China | Japan\n1970 | 926B  | 2126B",
  rows_are_records: "Year | country | gdp\n1970 | China   | 926B",
};

const HELPERS: Record<DataLayout, string> = {
  columns_are_series: "Each column is a category (e.g. China, Japan). One row = one time period.",
  rows_are_records: "Each row is one observation. Categories live in a column.",
};

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend" sx={{ fontSize: 13, mb: 0.5 }}>
        How should this dataset be read?
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value as DataLayout)}
      >
        {(Object.keys(DATA_LAYOUT_LABELS) as DataLayout[]).map((layout) => (
          <Box key={layout} sx={{ mb: 1 }}>
            <FormControlLabel
              value={layout}
              control={<Radio size="small" />}
              label={DATA_LAYOUT_LABELS[layout]}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: "block" }}>
              {HELPERS[layout]}
            </Typography>
            {value === layout && (
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  ml: 4,
                  mt: 0.5,
                  fontFamily: "monospace",
                  bgcolor: "action.hover",
                  p: 1,
                  borderRadius: 1,
                  whiteSpace: "pre",
                }}
              >
                {EXAMPLES[layout]}
              </Typography>
            )}
          </Box>
        ))}
      </RadioGroup>
    </FormControl>
  );
}

interface DatasetConfigFieldsProps {
  config: DatasetConfig;
  columns: string[];
  onChange: (config: DatasetConfig) => void;
}

export function DatasetConfigFields({ config, columns, onChange }: DatasetConfigFieldsProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <LayoutSelector
        value={config.layout}
        onChange={(layout) =>
          onChange({
            layout,
            keyColumn: layout === "columns_are_series" ? config.keyColumn ?? columns[0] : undefined,
            column: layout === "rows_are_records" ? config.column : undefined,
          })
        }
      />
      {config.layout === "columns_are_series" && columns.length > 0 && (
        <FormControl fullWidth size="small">
          <FormLabel sx={{ fontSize: 13, mb: 0.5 }}>Key column</FormLabel>
          <RadioGroup
            row
            value={config.keyColumn ?? columns[0]}
            onChange={(e) => onChange({ ...config, keyColumn: e.target.value })}
          >
            {columns.map((col) => (
              <FormControlLabel key={col} value={col} control={<Radio size="small" />} label={col} />
            ))}
          </RadioGroup>
          <Typography variant="caption" color="text.secondary">
            Row identifier (e.g. Year). Excluded from series and country lists.
          </Typography>
        </FormControl>
      )}
      {config.layout === "rows_are_records" && columns.length > 0 && (
        <FormControl fullWidth size="small">
          <FormLabel sx={{ fontSize: 13, mb: 0.5 }}>Category column</FormLabel>
          <RadioGroup
            value={config.column ?? ""}
            onChange={(e) => onChange({ ...config, column: e.target.value })}
          >
            {columns.map((col) => (
              <FormControlLabel key={col} value={col} control={<Radio size="small" />} label={col} />
            ))}
          </RadioGroup>
          <Typography variant="caption" color="text.secondary">
            Column containing category values (e.g. country names).
          </Typography>
        </FormControl>
      )}
    </Box>
  );
}
