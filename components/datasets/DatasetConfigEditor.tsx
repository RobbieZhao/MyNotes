"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { getOptionalExcludeColumns, defaultLabelColumn } from "@/lib/datasets/layout";
import type { DataLayout as DataLayoutType, DataValueUnit, DatasetConfig } from "@/types/dataset";
import { DATA_LAYOUT_LABELS, DATA_LAYOUT_VALUES, DATA_VALUE_UNIT_LABELS, DataLayout } from "@/types/dataset";

interface LayoutSelectorProps {
  value: DataLayoutType;
  onChange: (layout: DataLayoutType) => void;
}

const EXAMPLES: Record<DataLayoutType, string> = {
  [DataLayout.ColumnsAreSeries]: "Year | China | Japan\n1970 | 926B  | 2126B",
  [DataLayout.RowsAreSeries]: "GeoName | 2000 | 2001 | 2002\nAlabama | 168B | 168B | 172B",
  [DataLayout.RowsAreRecords]: "Year | country | gdp\n1970 | China   | 926B",
};

const HELPERS: Record<DataLayoutType, string> = {
  [DataLayout.ColumnsAreSeries]: "Each column is a category (e.g. China, Japan). One row = one time period.",
  [DataLayout.RowsAreSeries]: "Each row is a category (e.g. a state). One column = one time period.",
  [DataLayout.RowsAreRecords]: "Each row is one observation. Categories live in a column.",
};

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend" sx={{ fontSize: 13, mb: 0.5 }}>
        How should this dataset be read?
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value as DataLayoutType)}
      >
        {DATA_LAYOUT_VALUES.map((layout) => (
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
  const labelColumn = config.keyColumn ?? defaultLabelColumn(columns);
  const optionalExclude = getOptionalExcludeColumns(columns, labelColumn);
  const excluded = new Set(config.excludeColumns ?? []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <LayoutSelector
        value={config.layout}
        onChange={(layout) =>
          onChange({
            layout,
            keyColumn:
              layout === DataLayout.ColumnsAreSeries
                ? config.keyColumn ?? columns[0]
                : layout === DataLayout.RowsAreSeries
                  ? config.keyColumn ?? defaultLabelColumn(columns)
                  : undefined,
            column: layout === DataLayout.RowsAreRecords ? config.column : undefined,
            excludeColumns: layout === DataLayout.RowsAreSeries ? config.excludeColumns : undefined,
          })
        }
      />
      <FormControl fullWidth size="small">
        <InputLabel>Value unit</InputLabel>
        <Select
          label="Value unit"
          value={config.valueUnit ?? "raw"}
          onChange={(e) =>
            onChange({ ...config, valueUnit: e.target.value as DataValueUnit })
          }
        >
          {(Object.keys(DATA_VALUE_UNIT_LABELS) as DataValueUnit[]).map((unit) => (
            <MenuItem key={unit} value={unit}>
              {DATA_VALUE_UNIT_LABELS[unit]}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Multiplier applied to numeric cells when charts read this dataset. Use Millions if
          values are stored in millions (e.g. BEA GDP).
        </Typography>
      </FormControl>
      {config.layout === DataLayout.ColumnsAreSeries && columns.length > 0 && (
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
      {config.layout === DataLayout.RowsAreSeries && columns.length > 0 && (
        <>
          <FormControl fullWidth size="small">
            <FormLabel sx={{ fontSize: 13, mb: 0.5 }}>Label column</FormLabel>
            <RadioGroup
              value={labelColumn}
              onChange={(e) =>
                onChange({
                  ...config,
                  keyColumn: e.target.value,
                  excludeColumns: (config.excludeColumns ?? []).filter(
                    (col) => col !== e.target.value
                  ),
                })
              }
            >
              {columns
                .filter((col) => Number.isNaN(Number(col)))
                .map((col) => (
                  <FormControlLabel
                    key={col}
                    value={col}
                    control={<Radio size="small" />}
                    label={col}
                  />
                ))}
            </RadioGroup>
            <Typography variant="caption" color="text.secondary">
              Category name for each row (e.g. GeoName). Numeric year columns are detected
              automatically.
            </Typography>
          </FormControl>
          {optionalExclude.length > 0 && (
            <FormControl component="fieldset" fullWidth size="small">
              <FormLabel component="legend" sx={{ fontSize: 13, mb: 0.5 }}>
                Also exclude columns
              </FormLabel>
              <FormGroup row>
                {optionalExclude.map((col) => (
                  <FormControlLabel
                    key={col}
                    control={
                      <Checkbox
                        size="small"
                        checked={excluded.has(col)}
                        onChange={(e) => {
                          const next = new Set(config.excludeColumns ?? []);
                          if (e.target.checked) next.add(col);
                          else next.delete(col);
                          onChange({
                            ...config,
                            excludeColumns: [...next],
                          });
                        }}
                      />
                    }
                    label={col}
                  />
                ))}
              </FormGroup>
              <Typography variant="caption" color="text.secondary">
                Optional IDs or codes (e.g. GeoFIPS) that should not be treated as time periods.
              </Typography>
            </FormControl>
          )}
        </>
      )}
      {config.layout === DataLayout.RowsAreRecords && columns.length > 0 && (
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
