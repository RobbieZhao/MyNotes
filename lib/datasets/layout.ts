import type { DatasetConfig } from "@/types/dataset";
import { DataLayout, normalizeDatasetConfig } from "@/types/dataset";
import type { DatasetRow } from "@/types/database";
import { getDatasetColumns } from "./csv";

const LABEL_COLUMN_PREFERENCES = [
  "GeoName",
  "Name",
  "name",
  "state",
  "State",
  "country",
  "Country",
  "label",
  "Label",
];

export function defaultKeyColumn(rows: DatasetRow[]): string {
  return getDatasetColumns(rows)[0] ?? "";
}

export function defaultLabelColumn(columns: string[]): string {
  for (const preferred of LABEL_COLUMN_PREFERENCES) {
    if (columns.includes(preferred)) return preferred;
  }
  const nonNumeric = columns.filter((col) => Number.isNaN(Number(col)));
  if (nonNumeric.length > 0) return nonNumeric[nonNumeric.length - 1];
  return columns[0] ?? "";
}

function getExcludedColumns(config: DatasetConfig): Set<string> {
  const excluded = new Set<string>();
  if (config.keyColumn) excluded.add(config.keyColumn);
  if (config.column) excluded.add(config.column);
  for (const col of config.excludeColumns ?? []) excluded.add(col);
  return excluded;
}

/** Numeric column headers treated as time periods (for rows_are_series). */
export function getTimeColumns(rows: DatasetRow[], datasetConfig: DatasetConfig): string[] {
  const config = normalizeDatasetConfig(datasetConfig);
  const excluded = getExcludedColumns(config);
  return getDatasetColumns(rows)
    .filter((col) => !excluded.has(col) && !Number.isNaN(Number(col)))
    .sort((a, b) => Number(a) - Number(b));
}

export function getTimeColumnValues(rows: DatasetRow[], datasetConfig: DatasetConfig): number[] {
  return getTimeColumns(rows, datasetConfig).map((col) => Number(col));
}

export function getSeriesColumns(rows: DatasetRow[], keyColumn: string): string[] {
  return getDatasetColumns(rows).filter((col) => col !== keyColumn);
}

export function getKeyColumnValues(rows: DatasetRow[], keyColumn: string): number[] {
  return [
    ...new Set(
      rows
        .map((row) => Number(row[keyColumn]))
        .filter((v) => !Number.isNaN(v))
    ),
  ].sort((a, b) => a - b);
}

/** Available time keys for year pickers and line-chart linking. */
export function getAvailableTimeKeys(
  rows: DatasetRow[],
  datasetConfig: DatasetConfig
): number[] {
  const config = normalizeDatasetConfig(datasetConfig);
  if (config.layout === DataLayout.RowsAreSeries) {
    return getTimeColumnValues(rows, config);
  }
  if (config.layout === DataLayout.ColumnsAreSeries) {
    const keyColumn = config.keyColumn || defaultKeyColumn(rows);
    return keyColumn ? getKeyColumnValues(rows, keyColumn) : [];
  }
  return [];
}

/** Non-time columns that can be excluded from rows_are_series. */
export function getOptionalExcludeColumns(
  columns: string[],
  labelColumn: string
): string[] {
  return columns.filter(
    (col) => col !== labelColumn && Number.isNaN(Number(col))
  );
}
