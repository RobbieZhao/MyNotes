import {
  type ImportedDatasetConfig,
  isImportedDatasetConfig,
  isTidyMapping,
  isWideSeriesMapping,
  isWideTimeSeriesMapping,
  DATASET_SHAPE_LABELS,
} from "@/lib/datasets/datasetTypes";

export const DataLayout = {
  ColumnsAreSeries: "columns_are_series",
  RowsAreSeries: "rows_are_series",
  RowsAreRecords: "rows_are_records",
} as const;

export type DataLayout = (typeof DataLayout)[keyof typeof DataLayout];

export const DATA_LAYOUT_VALUES: DataLayout[] = Object.values(DataLayout);

export const DATA_LAYOUT_LABELS: Record<DataLayout, string> = {
  [DataLayout.ColumnsAreSeries]: "Columns are series",
  [DataLayout.RowsAreSeries]: "Rows are series",
  [DataLayout.RowsAreRecords]: "Rows are records",
};

export type DataValueUnit = "raw" | "thousands" | "millions" | "billions" | "trillions";

export const DATA_VALUE_UNIT_LABELS: Record<DataValueUnit, string> = {
  raw: "Raw (no scaling)",
  thousands: "Thousands (×1,000)",
  millions: "Millions (×1,000,000)",
  billions: "Billions (×1,000,000,000)",
  trillions: "Trillions (×1,000,000,000,000)",
};

/** Legacy chart-oriented config used by existing block interpreters. */
export interface LegacyDatasetConfig {
  layout: DataLayout;
  keyColumn?: string;
  column?: string;
  excludeColumns?: string[];
  valueUnit?: DataValueUnit;
}

export const DEFAULT_LEGACY_DATASET_CONFIG: LegacyDatasetConfig = {
  layout: DataLayout.ColumnsAreSeries,
};

export const DEFAULT_DATASET_CONFIG = DEFAULT_LEGACY_DATASET_CONFIG;

export type StoredDatasetConfig = ImportedDatasetConfig | LegacyDatasetConfig;

export type DatasetConfig = LegacyDatasetConfig;

export function importedConfigToLegacy(config: ImportedDatasetConfig): LegacyDatasetConfig {
  switch (config.shape) {
    case "wide_time_series": {
      if (!isWideTimeSeriesMapping(config.mapping)) {
        return DEFAULT_LEGACY_DATASET_CONFIG;
      }
      const { entityColumn, timeColumns } = config.mapping;
      const excluded = config.columns
        .map((col) => col.name)
        .filter((name) => name !== entityColumn && !timeColumns.includes(name));
      return {
        layout: DataLayout.RowsAreSeries,
        keyColumn: entityColumn,
        excludeColumns: excluded.length > 0 ? excluded : undefined,
      };
    }
    case "wide_series": {
      if (!isWideSeriesMapping(config.mapping)) {
        return DEFAULT_LEGACY_DATASET_CONFIG;
      }
      return {
        layout: DataLayout.ColumnsAreSeries,
        keyColumn: config.mapping.timeColumn,
      };
    }
    case "tidy": {
      if (!isTidyMapping(config.mapping)) {
        return DEFAULT_LEGACY_DATASET_CONFIG;
      }
      return {
        layout: DataLayout.RowsAreRecords,
        column: config.mapping.dimensionColumns[0],
        keyColumn: config.mapping.timeColumn,
      };
    }
    default:
      return {
        layout: DataLayout.RowsAreRecords,
      };
  }
}

export function normalizeDatasetConfig(
  config: Partial<StoredDatasetConfig> | null | undefined
): LegacyDatasetConfig {
  if (isImportedDatasetConfig(config)) {
    return importedConfigToLegacy(config);
  }

  const legacy = config as Partial<LegacyDatasetConfig> | null | undefined;

  return {
    layout: legacy?.layout ?? DEFAULT_LEGACY_DATASET_CONFIG.layout,
    keyColumn: legacy?.keyColumn,
    column: legacy?.column,
    excludeColumns: legacy?.excludeColumns,
    valueUnit: legacy?.valueUnit ?? "raw",
  };
}

export function getStoredConfigShape(
  config: StoredDatasetConfig | null | undefined
): ImportedDatasetConfig["shape"] | null {
  if (isImportedDatasetConfig(config)) return config.shape;

  const legacy = config as LegacyDatasetConfig | null | undefined;
  if (!legacy?.layout) return null;

  switch (legacy.layout) {
    case DataLayout.RowsAreSeries:
      return "wide_time_series";
    case DataLayout.ColumnsAreSeries:
      return "wide_series";
    case DataLayout.RowsAreRecords:
      return "tidy";
    default:
      return "generic";
  }
}

export function describeStoredDatasetConfig(config: StoredDatasetConfig): string {
  if (isImportedDatasetConfig(config)) {
    return DATASET_SHAPE_LABELS[config.shape];
  }
  return DATA_LAYOUT_LABELS[(config as LegacyDatasetConfig).layout];
}

/** Time periods are spread across columns (wide format). */
export function isWideTimeLayout(layout: DataLayout): boolean {
  return layout === DataLayout.ColumnsAreSeries || layout === DataLayout.RowsAreSeries;
}

export function describeDatasetLayout(config: LegacyDatasetConfig): string {
  const label = DATA_LAYOUT_LABELS[config.layout];
  if (config.layout === DataLayout.ColumnsAreSeries && config.keyColumn) {
    return `${label} (key: ${config.keyColumn})`;
  }
  if (config.layout === DataLayout.RowsAreSeries && config.keyColumn) {
    return `${label} (label: ${config.keyColumn})`;
  }
  if (config.layout === DataLayout.RowsAreRecords && config.column) {
    return `${label} (category: ${config.column})`;
  }
  if (config.valueUnit && config.valueUnit !== "raw") {
    return `${label} · values in ${config.valueUnit}`;
  }
  return label;
}

export type { ImportedDatasetConfig, DatasetShape, ColumnMetadata, DatasetMapping } from "@/lib/datasets/datasetTypes";
export { isImportedDatasetConfig, DATASET_SHAPE_LABELS } from "@/lib/datasets/datasetTypes";
