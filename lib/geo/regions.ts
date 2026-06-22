import type { MapRegion } from "@/types/blocks";
import { getCountryDisplayName, resolveCountryId } from "./countries";
import { getStateDisplayName, resolveStateId } from "./states";

export function resolveRegionId(label: string, mapRegion: MapRegion = "world"): string | null {
  if (mapRegion === "usa") return resolveStateId(label);
  return resolveCountryId(label);
}

export function getRegionDisplayName(
  id: string,
  mapRegion: MapRegion = "world",
  fallback?: string
): string {
  if (mapRegion === "usa") return getStateDisplayName(id, fallback);
  return getCountryDisplayName(id, fallback);
}
