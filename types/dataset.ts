export type DataLayout = "columns_are_series" | "rows_are_records";

export const DATA_LAYOUT_LABELS: Record<DataLayout, string> = {
  columns_are_series: "Columns are series",
  rows_are_records: "Rows are records",
};

export interface DatasetConfig {
  layout: DataLayout;
  /** columns_are_series: row key column (e.g. Year), excluded from series list */
  keyColumn?: string;
  /** rows_are_records: category column (e.g. country) */
  column?: string;
}

export const DEFAULT_DATASET_CONFIG: DatasetConfig = {
  layout: "columns_are_series",
};

export function normalizeDatasetConfig(
  config: Partial<DatasetConfig> | null | undefined
): DatasetConfig {
  return {
    layout: config?.layout ?? DEFAULT_DATASET_CONFIG.layout,
    keyColumn: config?.keyColumn,
    column: config?.column,
  };
}
