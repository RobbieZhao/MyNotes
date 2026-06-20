export type DatasetRow = Record<string, string | number>;

function parseNumber(raw: string): string | number {
  const num = Number(raw);
  return raw !== "" && !Number.isNaN(num) ? num : raw;
}

function splitCsvLine(line: string): string[] {
  return line.split(",").map((v) => v.trim());
}

export function parseCsv(text: string): { rows: DatasetRow[] } {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { rows: [] };
  }

  const headers = splitCsvLine(lines[0]);
  const rows: DatasetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const row: DatasetRow = {};

    headers.forEach((header, index) => {
      row[header] = parseNumber(values[index] ?? "");
    });

    rows.push(row);
  }

  return { rows };
}

export function getDatasetColumns(rows: DatasetRow[]): string[] {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]);
}
