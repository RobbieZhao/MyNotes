import Papa from "papaparse";

function coerceCellValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") return "";

  const num = Number(trimmed);
  if (trimmed !== "" && !Number.isNaN(num) && /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
    return num;
  }

  return trimmed;
}

export function parseCsv(text: string): Record<string, unknown>[] {
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(result.errors[0]?.message ?? "Failed to parse CSV");
  }

  const rows = result.data.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
  if (rows.length < 2) return [];

  const headers = rows[0].map((header, index) => {
    const name = String(header ?? "").trim();
    return name || `Column ${index + 1}`;
  });

  const parsed: Record<string, unknown>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const row: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      row[header] = coerceCellValue(String(values[index] ?? ""));
    });
    parsed.push(row);
  }

  return parsed;
}

export async function parseCsvFile(file: File): Promise<Record<string, unknown>[]> {
  const text = await file.text();
  return parseCsv(text);
}
