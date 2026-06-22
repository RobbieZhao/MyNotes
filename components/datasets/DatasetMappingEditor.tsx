"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import {
  COLUMN_TYPE_LABELS,
  DATASET_SHAPE_LABELS,
  type ColumnMetadata,
  type ColumnType,
  type DatasetMapping,
  type DatasetShape,
  isTidyMapping,
  isWideSeriesMapping,
  isWideTimeSeriesMapping,
} from "@/lib/datasets/datasetTypes";

interface DatasetMappingEditorProps {
  shape: DatasetShape;
  columns: ColumnMetadata[];
  mapping: DatasetMapping;
  onShapeChange: (shape: DatasetShape) => void;
  onColumnsChange: (columns: ColumnMetadata[]) => void;
  onMappingChange: (mapping: DatasetMapping) => void;
}

export function DatasetMappingEditor({
  shape,
  columns,
  mapping,
  onShapeChange,
  onColumnsChange,
  onMappingChange,
}: DatasetMappingEditorProps) {
  const columnNames = columns.map((column) => column.name);

  const updateColumnType = (name: string, type: ColumnType) => {
    onColumnsChange(
      columns.map((column) => (column.name === name ? { ...column, type } : column))
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Dataset shape</InputLabel>
        <Select
          label="Dataset shape"
          value={shape}
          onChange={(event) => onShapeChange(event.target.value as DatasetShape)}
        >
          {(Object.keys(DATASET_SHAPE_LABELS) as DatasetShape[]).map((option) => (
            <MenuItem key={option} value={option}>
              {DATASET_SHAPE_LABELS[option]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Column types
        </Typography>
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          {columns.map((column) => (
            <FormControl key={column.name} size="small" fullWidth>
              <InputLabel>{column.name}</InputLabel>
              <Select
                label={column.name}
                value={column.type}
                onChange={(event) =>
                  updateColumnType(column.name, event.target.value as ColumnType)
                }
              >
                {(Object.keys(COLUMN_TYPE_LABELS) as ColumnType[]).map((type) => (
                  <MenuItem key={type} value={type}>
                    {COLUMN_TYPE_LABELS[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Box>
      </Box>

      {shape === "wide_time_series" && isWideTimeSeriesMapping(mapping) && (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Entity column</InputLabel>
            <Select
              label="Entity column"
              value={mapping.entityColumn}
              onChange={(event) =>
                onMappingChange({ ...mapping, entityColumn: event.target.value })
              }
            >
              {columnNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Time columns</InputLabel>
            <Select
              multiple
              label="Time columns"
              value={mapping.timeColumns}
              onChange={(event) =>
                onMappingChange({
                  ...mapping,
                  timeColumns:
                    typeof event.target.value === "string"
                      ? event.target.value.split(",")
                      : event.target.value,
                })
              }
              renderValue={(selected) => selected.join(", ")}
            >
              {columnNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {shape === "wide_series" && isWideSeriesMapping(mapping) && (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Time column</InputLabel>
            <Select
              label="Time column"
              value={mapping.timeColumn}
              onChange={(event) =>
                onMappingChange({ ...mapping, timeColumn: event.target.value })
              }
            >
              {columnNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Series columns</InputLabel>
            <Select
              multiple
              label="Series columns"
              value={mapping.seriesColumns}
              onChange={(event) =>
                onMappingChange({
                  ...mapping,
                  seriesColumns:
                    typeof event.target.value === "string"
                      ? event.target.value.split(",")
                      : event.target.value,
                })
              }
              renderValue={(selected) => selected.join(", ")}
            >
              {columnNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {shape === "tidy" && isTidyMapping(mapping) && (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Time column</InputLabel>
            <Select
              label="Time column"
              value={mapping.timeColumn ?? ""}
              onChange={(event) =>
                onMappingChange({
                  ...mapping,
                  timeColumn: event.target.value || undefined,
                })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {columnNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Dimension columns</InputLabel>
            <Select
              multiple
              label="Dimension columns"
              value={mapping.dimensionColumns}
              onChange={(event) =>
                onMappingChange({
                  ...mapping,
                  dimensionColumns:
                    typeof event.target.value === "string"
                      ? event.target.value.split(",")
                      : event.target.value,
                })
              }
              renderValue={(selected) => selected.join(", ")}
            >
              {columnNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ gridColumn: { sm: "1 / -1" } }}>
            <InputLabel>Measure columns</InputLabel>
            <Select
              multiple
              label="Measure columns"
              value={mapping.measureColumns}
              onChange={(event) =>
                onMappingChange({
                  ...mapping,
                  measureColumns:
                    typeof event.target.value === "string"
                      ? event.target.value.split(",")
                      : event.target.value,
                })
              }
              renderValue={(selected) => selected.join(", ")}
            >
              {columnNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
}
