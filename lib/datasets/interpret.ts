import type { BarChartRaceBlockData, LineChartBlockData, PieChartBlockData } from "@/types/blocks";
import type { DatasetConfig } from "@/types/dataset";
import { normalizeDatasetConfig } from "@/types/dataset";
import type { DatasetRow } from "@/types/database";
import { getDatasetColumns } from "./csv";

export interface LineChartSeries {
  key: string;
  points: { x: number; y: number }[];
}

export interface PieChartSlice {
  label: string;
  value: number;
}

function getSeriesColumns(rows: DatasetRow[], keyColumn: string): string[] {
  return getDatasetColumns(rows).filter((col) => col !== keyColumn);
}

function defaultKeyColumn(rows: DatasetRow[]): string {
  return getDatasetColumns(rows)[0] ?? "";
}

export function getMultiSelectOptions(
  rows: DatasetRow[],
  datasetConfig: DatasetConfig
): string[] {
  const config = normalizeDatasetConfig(datasetConfig);

  if (config.layout === "columns_are_series") {
    const keyColumn = config.keyColumn || defaultKeyColumn(rows);
    return getDatasetColumns(rows).filter((col) => col !== keyColumn);
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

  if (config.layout === "columns_are_series") {
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
          y: Number(row[col]),
        }))
        .filter((p) => !Number.isNaN(p.x) && !Number.isNaN(p.y)),
    }));

    return { series, xLabel: keyColumn, yLabel: "Value" };
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
          y: Number(row[yColumn]),
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
            y: Number(row[yColumn]),
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

  if (config.layout === "columns_are_series") {
    const keyColumn = config.keyColumn || defaultKeyColumn(rows);
    const sliceYear = options?.sliceYear ?? blockConfig.sliceYear;
    if (!keyColumn || sliceYear === undefined) return [];

    const row = rows.find((r) => Number(r[keyColumn]) === sliceYear);
    if (!row) return [];

    let slices = getSeriesColumns(rows, keyColumn).map((col) => ({
      label: col,
      value: Number(row[col]) || 0,
    }));

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
    const value = Number(row[valueColumn]) || 0;
    aggregated.set(label, (aggregated.get(label) ?? 0) + value);
  }

  return Array.from(aggregated.entries()).map(([label, value]) => ({ label, value }));
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

  if (config.layout === "columns_are_series") {
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
            value: Number(row[col]) || 0,
          }))
          .filter((b) => b.value > 0 || activeCols.length <= 20);
        return { key, bars };
      })
      .filter((f): f is BarChartRaceFrame => f !== null)
      .sort((a, b) => a.key - b.key);

    return { frames, keyLabel: keyColumn, valueLabel: "Value" };
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
      value: Number(row[valueColumn]) || 0,
    }));

    if (selectedSeries?.length) {
      bars = bars.filter((b) => selectedSeries.includes(b.label));
    }

    return { key, bars: bars.filter((b) => b.label) };
  });

  return { frames, keyLabel: keyColumn, valueLabel: valueColumn };
}
