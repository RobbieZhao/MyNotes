import {
  type ImportedDatasetConfig,
  isGenericMapping,
  isTidyMapping,
  isWideSeriesMapping,
  isWideTimeSeriesMapping,
} from "./datasetTypes";

export type NormalizedRow = Record<string, unknown>;

export function normalizeDataset(
  data: Record<string, unknown>[],
  config: ImportedDatasetConfig
): NormalizedRow[] {
  switch (config.shape) {
    case "wide_time_series":
      return normalizeWideTimeSeries(data, config);
    case "wide_series":
      return normalizeWideSeries(data, config);
    case "tidy":
      return normalizeTidy(data, config);
    default:
      return data.map((row) => ({ ...row }));
  }
}

function normalizeWideTimeSeries(
  data: Record<string, unknown>[],
  config: ImportedDatasetConfig
): NormalizedRow[] {
  if (!isWideTimeSeriesMapping(config.mapping)) return [];

  const { entityColumn, timeColumns } = config.mapping;
  const normalized: NormalizedRow[] = [];

  for (const row of data) {
    const entity = row[entityColumn];
    for (const timeColumn of timeColumns) {
      normalized.push({
        [entityColumn]: entity,
        Year: Number(timeColumn),
        Value: row[timeColumn],
      });
    }
  }

  return normalized;
}

function normalizeWideSeries(
  data: Record<string, unknown>[],
  config: ImportedDatasetConfig
): NormalizedRow[] {
  if (!isWideSeriesMapping(config.mapping)) return [];

  const { timeColumn, seriesColumns } = config.mapping;
  const normalized: NormalizedRow[] = [];

  for (const row of data) {
    const timeValue = row[timeColumn];
    for (const seriesColumn of seriesColumns) {
      normalized.push({
        [timeColumn]: timeValue,
        Series: seriesColumn,
        Value: row[seriesColumn],
      });
    }
  }

  return normalized;
}

function normalizeTidy(
  data: Record<string, unknown>[],
  config: ImportedDatasetConfig
): NormalizedRow[] {
  if (!isTidyMapping(config.mapping)) return data.map((row) => ({ ...row }));

  const { dimensionColumns, measureColumns, timeColumn } = config.mapping;
  const normalized: NormalizedRow[] = [];

  for (const row of data) {
    for (const measureColumn of measureColumns) {
      const normalizedRow: NormalizedRow = {
        Value: row[measureColumn],
        Measure: measureColumn,
      };

      for (const dimensionColumn of dimensionColumns) {
        normalizedRow[dimensionColumn] = row[dimensionColumn];
      }

      if (timeColumn) {
        normalizedRow[timeColumn] = row[timeColumn];
      }

      normalized.push(normalizedRow);
    }
  }

  return normalized;
}

export function previewNormalizedRows(
  data: Record<string, unknown>[],
  config: ImportedDatasetConfig,
  limit = 5
): NormalizedRow[] {
  return normalizeDataset(data, config).slice(0, limit);
}

export function isNormalizedDatasetConfig(
  config: ImportedDatasetConfig
): boolean {
  if (config.shape === "generic") {
    return isGenericMapping(config.mapping);
  }
  return true;
}
