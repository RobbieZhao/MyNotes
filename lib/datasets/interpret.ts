import { resolveRegionId } from "@/lib/geo/regions";
import type {
  BarChartRaceBlockData,
  ChoroplethMapBlockData,
  LineChartBlockData,
  PieChartBlockData,
} from "@/types/blocks";
import type { DatasetConfig } from "@/types/dataset";
import { DataLayout, normalizeDatasetConfig } from "@/types/dataset";
import type { DatasetRow } from "@/types/database";
import {
  defaultKeyColumn,
  getAvailableTimeKeys,
  getSeriesColumns,
  getTimeColumns,
  getKeyColumnValues,
} from "./layout";
import { readDatasetValue } from "./values";

export {
  getAvailableTimeKeys,
  getKeyColumnValues,
  getTimeColumnValues,
  getTimeColumns,
} from "./layout";

export interface LineChartSeries {
  key: string;
  points: { x: number; y: number }[];
}

export interface PieChartSlice {
  label: string;
  value: number;
}

export function getMultiSelectOptions(
  rows: DatasetRow[],
  datasetConfig: DatasetConfig
): string[] {
  const config = normalizeDatasetConfig(datasetConfig);

  if (config.layout === DataLayout.ColumnsAreSeries) {
    const keyColumn = config.keyColumn || defaultKeyColumn(rows);
    return getSeriesColumns(rows, keyColumn);
  }

  if (config.layout === DataLayout.RowsAreSeries) {
    const labelColumn = config.keyColumn || defaultKeyColumn(rows);
    return [
      ...new Set(rows.map((row) => String(row[labelColumn] ?? "")).filter(Boolean)),
    ];
  }

  if (!config.column) return [];
  return [
    ...new Set(rows.map((row) => String(row[config.column!] ?? "")).filter(Boolean)),
  ];
}

export function getLineChartSeries(
  rows: DatasetRow[],
  datasetConfig: DatasetConfig,
  blockConfig: LineChartBlockData,
  selectedSeries: string[]
): { series: LineChartSeries[]; xLabel: string; yLabel: string } {
  const config = normalizeDatasetConfig(datasetConfig);

  if (config.layout === DataLayout.ColumnsAreSeries) {
    const keyColumn = config.keyColumn || defaultKeyColumn(rows);
    if (!keyColumn) return { series: [], xLabel: "", yLabel: "Value" };

    const allSeries = getSeriesColumns(rows, keyColumn);
    const active = selectedSeries.length
      ? selectedSeries.filter((s) => allSeries.includes(s))
      : allSeries;

    const series = active.map((col) => ({
      key: col,
      points: rows
        .map((row) => ({
          x: Number(row[keyColumn]),
          y: readDatasetValue(row[col], config),
        }))
        .filter((p) => !Number.isNaN(p.x) && !Number.isNaN(p.y)),
    }));

    return { series, xLabel: keyColumn, yLabel: "Value" };
  }

  if (config.layout === DataLayout.RowsAreSeries) {
    const labelColumn = config.keyColumn || defaultKeyColumn(rows);
    const timeColumns = getTimeColumns(rows, config);
    const allLabels = [
      ...new Set(rows.map((row) => String(row[labelColumn] ?? "")).filter(Boolean)),
    ];
    const active = selectedSeries.length
      ? selectedSeries.filter((s) => allLabels.includes(s))
      : allLabels;

    const series = active
      .map((label) => {
        const row = rows.find((r) => String(r[labelColumn]) === label);
        if (!row) return { key: label, points: [] as { x: number; y: number }[] };
        return {
          key: label,
          points: timeColumns
            .map((timeCol) => ({
              x: Number(timeCol),
              y: readDatasetValue(row[timeCol], config),
            }))
            .filter((p) => !Number.isNaN(p.x) && !Number.isNaN(p.y)),
        };
      })
      .filter((s) => s.points.length > 0);

    return { series, xLabel: "Year", yLabel: "Value" };
  }

  const xColumn = blockConfig.xColumn ?? "";
  const yColumn = blockConfig.yColumn ?? "";
  if (!xColumn || !yColumn) return { series: [], xLabel: xColumn, yLabel: yColumn };

  const dimColumn = config.column;
  let filtered = rows;

  if (dimColumn && selectedSeries.length) {
    filtered = rows.filter((row) =>
      selectedSeries.includes(String(row[dimColumn] ?? ""))
    );
  }

  if (dimColumn) {
    const groups = selectedSeries.length
      ? selectedSeries
      : [...new Set(filtered.map((row) => String(row[dimColumn] ?? "")))];

    const series = groups.map((key) => ({
      key,
      points: filtered
        .filter((row) => String(row[dimColumn]) === key)
        .map((row) => ({
          x: Number(row[xColumn]),
          y: readDatasetValue(row[yColumn], config),
        }))
        .filter((p) => !Number.isNaN(p.x) && !Number.isNaN(p.y)),
    }));

    return { series, xLabel: xColumn, yLabel: yColumn };
  }

  return {
    series: [
      {
        key: "all",
        points: filtered
          .map((row) => ({
            x: Number(row[xColumn]),
            y: readDatasetValue(row[yColumn], config),
          }))
          .filter((p) => !Number.isNaN(p.x) && !Number.isNaN(p.y)),
      },
    ],
    xLabel: xColumn,
    yLabel: yColumn,
  };
}

export function getPieChartSlices(
  rows: DatasetRow[],
  datasetConfig: DatasetConfig,
  blockConfig: PieChartBlockData,
  options?: {
    sliceYear?: number;
    selectedSeries?: string[];
  }
): PieChartSlice[] {
  const config = normalizeDatasetConfig(datasetConfig);

  if (config.layout === DataLayout.ColumnsAreSeries) {
    const keyColumn = config.keyColumn || defaultKeyColumn(rows);
    const sliceYear = options?.sliceYear ?? blockConfig.sliceYear;
    if (!keyColumn || sliceYear === undefined) return [];

    const row = rows.find((r) => Number(r[keyColumn]) === sliceYear);
    if (!row) return [];

    let slices = getSeriesColumns(rows, keyColumn).map((col) => ({
      label: col,
      value: readDatasetValue(row[col], config),
    }));

    if (options?.selectedSeries?.length) {
      slices = slices.filter((s) => options.selectedSeries!.includes(s.label));
    }

    return slices;
  }

  if (config.layout === DataLayout.RowsAreSeries) {
    const labelColumn = config.keyColumn || defaultKeyColumn(rows);
    const sliceYear = options?.sliceYear ?? blockConfig.sliceYear;
    if (!labelColumn || sliceYear === undefined) return [];

    const yearCol = String(sliceYear);
    let slices = rows
      .map((row) => ({
        label: String(row[labelColumn] ?? ""),
        value: readDatasetValue(row[yearCol], config),
      }))
      .filter((s) => s.label);

    if (options?.selectedSeries?.length) {
      slices = slices.filter((s) => options.selectedSeries!.includes(s.label));
    }

    return slices;
  }

  const labelColumn = blockConfig.labelColumn ?? "";
  const valueColumn = blockConfig.valueColumn ?? "";
  if (!labelColumn || !valueColumn) return [];

  const aggregated = new Map<string, number>();
  for (const row of rows) {
    const label = String(row[labelColumn] ?? "");
    const value = readDatasetValue(row[valueColumn], config);
    aggregated.set(label, (aggregated.get(label) ?? 0) + value);
  }

  return Array.from(aggregated.entries()).map(([label, value]) => ({ label, value }));
}

export interface BarChartRaceBar {
  label: string;
  value: number;
}

export interface BarChartRaceFrame {
  key: number;
  bars: BarChartRaceBar[];
}

export function getBarChartRaceFrames(
  rows: DatasetRow[],
  datasetConfig: DatasetConfig,
  blockConfig: BarChartRaceBlockData,
  selectedSeries?: string[]
): { frames: BarChartRaceFrame[]; keyLabel: string; valueLabel: string } {
  const config = normalizeDatasetConfig(datasetConfig);

  if (config.layout === DataLayout.ColumnsAreSeries) {
    const keyColumn = config.keyColumn || defaultKeyColumn(rows);
    if (!keyColumn) return { frames: [], keyLabel: "", valueLabel: "Value" };

    const seriesCols = getSeriesColumns(rows, keyColumn);
    const activeCols = selectedSeries?.length
      ? seriesCols.filter((col) => selectedSeries.includes(col))
      : seriesCols;

    const frames = rows
      .map((row) => {
        const key = Number(row[keyColumn]);
        if (Number.isNaN(key)) return null;
        const bars = activeCols
          .map((col) => ({
            label: col,
            value: readDatasetValue(row[col], config),
          }))
          .filter((b) => b.value > 0 || activeCols.length <= 20);
        return { key, bars };
      })
      .filter((f): f is BarChartRaceFrame => f !== null)
      .sort((a, b) => a.key - b.key);

    return { frames, keyLabel: keyColumn, valueLabel: "Value" };
  }

  if (config.layout === DataLayout.RowsAreSeries) {
    const labelColumn = config.keyColumn || defaultKeyColumn(rows);
    const timeColumns = getTimeColumns(rows, config);
    if (!labelColumn || timeColumns.length === 0) {
      return { frames: [], keyLabel: "Year", valueLabel: "Value" };
    }

    const activeRows = selectedSeries?.length
      ? rows.filter((row) => selectedSeries.includes(String(row[labelColumn] ?? "")))
      : rows;

    const frames = timeColumns
      .map((timeCol) => ({
        key: Number(timeCol),
        bars: activeRows
          .map((row) => ({
            label: String(row[labelColumn] ?? ""),
            value: readDatasetValue(row[timeCol], config),
          }))
          .filter((b) => b.label),
      }))
      .filter((f) => !Number.isNaN(f.key))
      .sort((a, b) => a.key - b.key);

    return { frames, keyLabel: "Year", valueLabel: "Value" };
  }

  const labelColumn = blockConfig.labelColumn ?? "";
  const valueColumn = blockConfig.valueColumn ?? "";
  const keyColumn = config.keyColumn || defaultKeyColumn(rows);
  if (!labelColumn || !valueColumn || !keyColumn) {
    return { frames: [], keyLabel: keyColumn, valueLabel: valueColumn };
  }

  const keys = getKeyColumnValues(rows, keyColumn);
  const frames = keys.map((key) => {
    const slice = rows.filter((row) => Number(row[keyColumn]) === key);
    let bars = slice.map((row) => ({
      label: String(row[labelColumn] ?? ""),
      value: readDatasetValue(row[valueColumn], config),
    }));

    if (selectedSeries?.length) {
      bars = bars.filter((b) => selectedSeries.includes(b.label));
    }

    return { key, bars: bars.filter((b) => b.label) };
  });

  return { frames, keyLabel: keyColumn, valueLabel: valueColumn };
}

export interface ChoroplethRegion {
  id: string;
  label: string;
  value: number;
}

export interface ChoroplethMapFrame {
  key: number;
  regions: ChoroplethRegion[];
}

function labelValuePairsToRegions(
  pairs: { label: string; value: number }[],
  mapRegion: ChoroplethMapBlockData["mapRegion"] = "world"
): ChoroplethRegion[] {
  const region = mapRegion ?? "world";
  const regions: ChoroplethRegion[] = [];
  for (const { label, value } of pairs) {
    const id = resolveRegionId(label, region);
    if (!id) continue;
    regions.push({ id, label, value });
  }
  return regions;
}

export function getChoroplethRegions(
  rows: DatasetRow[],
  datasetConfig: DatasetConfig,
  blockConfig: ChoroplethMapBlockData,
  options?: {
    sliceYear?: number;
    selectedSeries?: string[];
  }
): ChoroplethRegion[] {
  const slices = getPieChartSlices(rows, datasetConfig, blockConfig, options);
  return labelValuePairsToRegions(slices, blockConfig.mapRegion);
}

export function getChoroplethFrames(
  rows: DatasetRow[],
  datasetConfig: DatasetConfig,
  blockConfig: ChoroplethMapBlockData,
  selectedSeries?: string[]
): { frames: ChoroplethMapFrame[]; keyLabel: string } {
  const { frames, keyLabel } = getBarChartRaceFrames(
    rows,
    datasetConfig,
    blockConfig,
    selectedSeries
  );

  return {
    frames: frames.map((frame) => ({
      key: frame.key,
      regions: labelValuePairsToRegions(frame.bars, blockConfig.mapRegion),
    })),
    keyLabel,
  };
}
