export type DatasetShape = "tidy" | "wide_time_series" | "wide_series" | "generic";

export type ColumnType = "numeric" | "date" | "category" | "unknown";

export type ColumnMetadata = {
  name: string;
  type: ColumnType;
  numericPercent: number;
  datePercent: number;
  uniqueCount: number;
};

export type WideTimeSeriesMapping = {
  entityColumn: string;
  timeColumns: string[];
};

export type WideSeriesMapping = {
  timeColumn: string;
  seriesColumns: string[];
};

export type TidyMapping = {
  dimensionColumns: string[];
  measureColumns: string[];
  timeColumn?: string;
};

export type GenericMapping = {
  columns: string[];
};

export type DatasetMapping =
  | WideTimeSeriesMapping
  | WideSeriesMapping
  | TidyMapping
  | GenericMapping;

export type DatasetDetectionResult = {
  shape: DatasetShape;
  confidence: number;
  columns: ColumnMetadata[];
  mapping: DatasetMapping;
};

export type ImportedDatasetConfig = {
  shape: DatasetShape;
  rowCount: number;
  columnCount: number;
  columns: ColumnMetadata[];
  mapping: DatasetMapping;
};

export const DATASET_SHAPE_LABELS: Record<DatasetShape, string> = {
  tidy: "Tidy / Long",
  wide_time_series: "Wide Time Series",
  wide_series: "Wide Series",
  generic: "Generic",
};

export const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
  numeric: "Numeric",
  date: "Date",
  category: "Category",
  unknown: "Unknown",
};

export function getDatasetColumns(rows: Record<string, unknown>[]): string[] {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]);
}

export function buildImportedConfig(
  rows: Record<string, unknown>[],
  detection: DatasetDetectionResult,
  columnsOverride?: ColumnMetadata[]
): ImportedDatasetConfig {
  const columns = columnsOverride ?? detection.columns;
  return {
    shape: detection.shape,
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
    mapping: detection.mapping,
  };
}

export function isWideTimeSeriesMapping(
  mapping: DatasetMapping
): mapping is WideTimeSeriesMapping {
  return "entityColumn" in mapping && "timeColumns" in mapping;
}

export function isWideSeriesMapping(mapping: DatasetMapping): mapping is WideSeriesMapping {
  return "timeColumn" in mapping && "seriesColumns" in mapping;
}

export function isTidyMapping(mapping: DatasetMapping): mapping is TidyMapping {
  return "dimensionColumns" in mapping && "measureColumns" in mapping;
}

export function isGenericMapping(mapping: DatasetMapping): mapping is GenericMapping {
  return "columns" in mapping && !("entityColumn" in mapping) && !("timeColumn" in mapping);
}

export function isImportedDatasetConfig(
  config: unknown
): config is ImportedDatasetConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "shape" in config &&
    "columns" in config &&
    "mapping" in config
  );
}
