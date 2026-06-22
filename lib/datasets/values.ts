import type { DatasetConfig } from "@/types/dataset";
import { normalizeDatasetConfig } from "@/types/dataset";
import type { DataValueUnit } from "@/types/dataset";

const VALUE_UNIT_MULTIPLIERS: Record<DataValueUnit, number> = {
  raw: 1,
  thousands: 1_000,
  millions: 1_000_000,
  billions: 1_000_000_000,
  trillions: 1_000_000_000_000,
};

export function getValueMultiplier(config: DatasetConfig): number {
  const unit = normalizeDatasetConfig(config).valueUnit ?? "raw";
  return VALUE_UNIT_MULTIPLIERS[unit];
}

/** Read a numeric cell and apply the dataset value unit multiplier. */
export function readDatasetValue(
  raw: string | number | undefined | null,
  config: DatasetConfig
): number {
  const n = Number(raw);
  if (Number.isNaN(n)) return 0;
  return n * getValueMultiplier(config);
}
