import { schemeTableau10 } from "d3";

export const CHART_COLORS = schemeTableau10;

export function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
