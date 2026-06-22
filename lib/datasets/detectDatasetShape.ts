import {
  type ColumnMetadata,
  type ColumnType,
  type DatasetDetectionResult,
  type DatasetMapping,
  type DatasetShape,
  getDatasetColumns,
} from "./datasetTypes";

const YEAR_HEADER = /^\d{4}$/;
const DATE_PATTERNS = [
  /^\d{4}$/,
  /^\d{4}-\d{2}$/,
  /^\d{4}-\d{2}-\d{2}$/,
];

function isYearHeader(name: string): boolean {
  return YEAR_HEADER.test(name.trim());
}

function isDateValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  const text = String(value).trim();
  return DATE_PATTERNS.some((pattern) => pattern.test(text));
}

function isNumericValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "number") return !Number.isNaN(value);
  const text = String(value).trim();
  if (text === "") return false;
  return !Number.isNaN(Number(text));
}

function analyzeColumn(name: string, rows: Record<string, unknown>[]): ColumnMetadata {
  const values = rows
    .map((row) => row[name])
    .filter((value) => value !== null && value !== undefined && value !== "");

  const total = values.length;
  const numericCount = values.filter(isNumericValue).length;
  const dateCount = values.filter(isDateValue).length;
  const uniqueCount = new Set(values.map((value) => String(value))).size;

  const numericPercent = total === 0 ? 0 : numericCount / total;
  const datePercent = total === 0 ? 0 : dateCount / total;

  let type: ColumnType = "unknown";
  if (datePercent > 0.8) type = "date";
  else if (numericPercent > 0.8) type = "numeric";
  else if (total > 0) type = "category";

  return {
    name,
    type,
    numericPercent,
    datePercent,
    uniqueCount,
  };
}

function isMostlyCategorical(columns: ColumnMetadata[]): boolean {
  if (columns.length === 0) return false;
  const categorical = columns.filter((col) => col.type === "category" || col.type === "unknown");
  return categorical.length / columns.length >= 0.5;
}

function isMostlyNumeric(columns: ColumnMetadata[]): boolean {
  if (columns.length === 0) return false;
  const numeric = columns.filter((col) => col.type === "numeric");
  return numeric.length / columns.length >= 0.7;
}

function detectWideTimeSeries(
  columns: ColumnMetadata[]
): { mapping: DatasetMapping; confidence: number } | null {
  const yearHeaders = columns.filter((col) => isYearHeader(col.name));
  const nonYearColumns = columns.filter((col) => !isYearHeader(col.name));

  if (columns.length === 0) return null;
  if (yearHeaders.length / columns.length < 0.7) return null;
  if (!isMostlyCategorical(nonYearColumns)) return null;

  const entityColumn =
    nonYearColumns.find((col) => col.type === "category")?.name ?? nonYearColumns[0]?.name;
  if (!entityColumn) return null;

  const timeColumns = columns.filter((col) => isYearHeader(col.name)).map((col) => col.name);
  const confidence = Math.min(
    0.98,
    0.6 + yearHeaders.length / columns.length * 0.3 + (isMostlyCategorical(nonYearColumns) ? 0.08 : 0)
  );

  return {
    mapping: { entityColumn, timeColumns },
    confidence,
  };
}

function detectWideSeries(
  columns: ColumnMetadata[]
): { mapping: DatasetMapping; confidence: number } | null {
  if (columns.length < 2) return null;

  const [first, ...rest] = columns;
  if (first.type !== "date" && first.datePercent < 0.5) return null;
  if (!isMostlyNumeric(rest)) return null;

  const confidence = Math.min(
    0.95,
    0.55 + first.datePercent * 0.25 + (isMostlyNumeric(rest) ? 0.15 : 0)
  );

  return {
    mapping: {
      timeColumn: first.name,
      seriesColumns: rest.map((col) => col.name),
    },
    confidence,
  };
}

function detectTidy(
  columns: ColumnMetadata[]
): { mapping: DatasetMapping; confidence: number } | null {
  const dateColumns = columns.filter((col) => col.type === "date");
  const categoryColumns = columns.filter((col) => col.type === "category");
  const numericColumns = columns.filter((col) => col.type === "numeric");

  if (dateColumns.length === 0 || categoryColumns.length === 0 || numericColumns.length === 0) {
    return null;
  }

  const timeColumn = dateColumns[0]?.name;
  const dimensionColumns = categoryColumns.map((col) => col.name);
  const measureColumns = numericColumns.map((col) => col.name);

  const confidence = Math.min(
    0.92,
    0.5 +
      Math.min(dateColumns.length, 1) * 0.15 +
      Math.min(categoryColumns.length, 2) * 0.1 +
      Math.min(measureColumns.length, 2) * 0.1
  );

  return {
    mapping: {
      dimensionColumns,
      measureColumns,
      timeColumn,
    },
    confidence,
  };
}

function buildGenericMapping(columns: ColumnMetadata[]): DatasetMapping {
  return { columns: columns.map((col) => col.name) };
}

export function detectDatasetShape(rows: Record<string, unknown>[]): DatasetDetectionResult {
  const columnNames = getDatasetColumns(rows);
  const columns = columnNames.map((name) => analyzeColumn(name, rows));

  if (columns.length === 0) {
    return {
      shape: "generic",
      confidence: 0,
      columns: [],
      mapping: { columns: [] },
    };
  }

  const wideTimeSeries = detectWideTimeSeries(columns);
  if (wideTimeSeries) {
    return {
      shape: "wide_time_series",
      confidence: wideTimeSeries.confidence,
      columns,
      mapping: wideTimeSeries.mapping,
    };
  }

  const wideSeries = detectWideSeries(columns);
  if (wideSeries) {
    return {
      shape: "wide_series",
      confidence: wideSeries.confidence,
      columns,
      mapping: wideSeries.mapping,
    };
  }

  const tidy = detectTidy(columns);
  if (tidy) {
    return {
      shape: "tidy",
      confidence: tidy.confidence,
      columns,
      mapping: tidy.mapping,
    };
  }

  return {
    shape: "generic",
    confidence: 0.35,
    columns,
    mapping: buildGenericMapping(columns),
  };
}

export function redetectWithShape(
  rows: Record<string, unknown>[],
  shape: DatasetShape,
  columns: ColumnMetadata[]
): DatasetMapping {
  const columnNames = columns.map((col) => col.name);

  switch (shape) {
    case "wide_time_series": {
      const entityColumn =
        columns.find((col) => col.type === "category" && !isYearHeader(col.name))?.name ??
        columns.find((col) => !isYearHeader(col.name))?.name ??
        columnNames[0] ??
        "";
      const timeColumns = columns.filter((col) => isYearHeader(col.name)).map((col) => col.name);
      return { entityColumn, timeColumns };
    }
    case "wide_series": {
      const timeColumn =
        columns.find((col) => col.type === "date")?.name ?? columns[0]?.name ?? "";
      const seriesColumns = columns
        .filter((col) => col.name !== timeColumn)
        .filter((col) => col.type === "numeric" || col.type === "unknown")
        .map((col) => col.name);
      return { timeColumn, seriesColumns };
    }
    case "tidy": {
      const timeColumn = columns.find((col) => col.type === "date")?.name;
      const dimensionColumns = columns
        .filter((col) => col.type === "category")
        .map((col) => col.name);
      const measureColumns = columns
        .filter((col) => col.type === "numeric")
        .map((col) => col.name);
      return { dimensionColumns, measureColumns, timeColumn };
    }
    default:
      return { columns: columnNames };
  }
}
