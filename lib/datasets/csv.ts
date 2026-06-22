import { parseCsv as parseCsvRows } from "./parseCsv";
import { getDatasetColumns as getColumns } from "./datasetTypes";

export type DatasetRow = Record<string, string | number>;

export function parseCsv(text: string): { rows: DatasetRow[] } {
  const rows = parseCsvRows(text) as DatasetRow[];
  return { rows };
}

export function getDatasetColumns(rows: DatasetRow[]): string[] {
  return getColumns(rows);
}

export { parseCsvFile } from "./parseCsv";
