export type YAxisScale =
  | "auto"
  | "raw"
  | "thousands"
  | "millions"
  | "billions"
  | "trillions"
  | "log";

export const Y_AXIS_SCALE_LABELS: Record<YAxisScale, string> = {
  auto: "Auto (abbreviate)",
  raw: "Raw values",
  thousands: "Thousands (K)",
  millions: "Millions (M)",
  billions: "Billions (B)",
  trillions: "Trillions (T)",
  log: "Logarithmic",
};

const DIVISORS: Record<Exclude<YAxisScale, "auto" | "raw" | "log">, number> = {
  thousands: 1_000,
  millions: 1_000_000,
  billions: 1_000_000_000,
  trillions: 1_000_000_000_000,
};

const SUFFIXES: Record<Exclude<YAxisScale, "auto" | "raw" | "log">, string> = {
  thousands: "K",
  millions: "M",
  billions: "B",
  trillions: "T",
};

export function resolveYScaleMode(
  scale: YAxisScale | undefined,
  maxValue: number
): Exclude<YAxisScale, "auto"> {
  if (scale && scale !== "auto") return scale;
  if (maxValue >= 1e12) return "trillions";
  if (maxValue >= 1e9) return "billions";
  if (maxValue >= 1e6) return "millions";
  if (maxValue >= 1e3) return "thousands";
  return "raw";
}

export function formatYTick(value: number, scale: Exclude<YAxisScale, "auto">): string {
  if (scale === "log") {
    if (value <= 0) return "0";
    const exp = Math.log10(value);
    if (Math.abs(exp - Math.round(exp)) < 0.001) return `10^${Math.round(exp)}`;
    return value.toExponential(0);
  }
  if (scale === "raw") {
    if (Math.abs(value) >= 1e9) return value.toExponential(1);
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  const suffix = SUFFIXES[scale];
  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(decimals)}${suffix}`;
}

/** Format a tick that is already in display (scaled) units. */
export function formatYTickDisplay(
  displayValue: number,
  scale: Exclude<YAxisScale, "auto">
): string {
  return formatYTick(
    scale === "raw" || scale === "log" ? displayValue : displayValue,
    scale
  );
}

export function scaleYValue(value: number, scale: Exclude<YAxisScale, "auto" | "log">): number {
  if (scale === "raw") return value;
  return value / DIVISORS[scale];
}

export function formatValue(value: number, scale: YAxisScale | undefined): string {
  const mode = resolveYScaleMode(scale, value);
  if (mode === "raw" || mode === "log") return formatYTick(value, mode);
  return formatYTickDisplay(value / DIVISORS[mode], mode);
}

/** Scales suitable for pie chart value display (no log). */
export type PieValueScale = Exclude<YAxisScale, "log">;

export const PIE_VALUE_SCALE_LABELS: Record<PieValueScale, string> = {
  auto: Y_AXIS_SCALE_LABELS.auto,
  raw: Y_AXIS_SCALE_LABELS.raw,
  thousands: Y_AXIS_SCALE_LABELS.thousands,
  millions: Y_AXIS_SCALE_LABELS.millions,
  billions: Y_AXIS_SCALE_LABELS.billions,
  trillions: Y_AXIS_SCALE_LABELS.trillions,
};

export function estimateTickLabelWidth(
  displayTicks: number[],
  scale: Exclude<YAxisScale, "auto">
): number {
  if (displayTicks.length === 0) return 48;
  const maxLen = Math.max(
    ...displayTicks.map((t) => formatYTickDisplay(t, scale).length),
    4
  );
  return maxLen * 7 + 16;
}
