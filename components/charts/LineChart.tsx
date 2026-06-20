"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { line, max, min, scaleLinear, scaleLog, scaleOrdinal } from "d3";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getColor } from "@/lib/d3/colors";
import {
  estimateTickLabelWidth,
  formatYTickDisplay,
  formatValue,
  resolveYScaleMode,
  scaleYValue,
  type YAxisScale,
} from "@/lib/d3/format";
import type { LineChartSeries } from "@/lib/datasets/interpret";

interface LineChartProps {
  series: LineChartSeries[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  yAxisScale?: YAxisScale;
  showLegend?: boolean;
  height?: number;
  crosshair?: boolean;
  selectedX?: number | null;
  onXSelect?: (x: number) => void;
}

const BASE = { top: 12, right: 20, bottom: 44, left: 12 };
const CROSSHAIR_TOP_PAD = 24;
const CROSSHAIR_BOTTOM_HINT = 22;

function snapToNearestX(value: number, values: number[]): number {
  if (values.length === 0) return value;
  return values.reduce((best, v) =>
    Math.abs(v - value) < Math.abs(best - value) ? v : best
  );
}

function toDisplayY(y: number, mode: Exclude<YAxisScale, "auto">): number {
  if (mode === "log" || mode === "raw") return y;
  return scaleYValue(y, mode);
}

export function LineChart({
  series,
  title = "",
  xLabel = "",
  yLabel = "Value",
  yAxisScale = "auto",
  showLegend = true,
  height = 340,
  crosshair = false,
  selectedX = null,
  onXSelect,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(480);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    key: string;
    x: number;
    y: number;
    rawY: number;
    dataX: number;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rawSeries = useMemo(
    () =>
      series.map((s) => ({
        key: s.key,
        points: s.points.map((p) => ({ x: p.x, rawY: p.y, y: p.y })),
      })),
    [series]
  );

  const allRawPoints = useMemo(
    () => rawSeries.flatMap((s) => s.points),
    [rawSeries]
  );
  const rawYMax = useMemo(() => max(allRawPoints, (p) => p.rawY) ?? 1, [allRawPoints]);
  const mode = useMemo(() => resolveYScaleMode(yAxisScale, rawYMax), [yAxisScale, rawYMax]);

  const displaySeries = useMemo(
    () =>
      rawSeries.map((s) => ({
        key: s.key,
        points: s.points
          .filter((p) => (mode === "log" ? p.rawY > 0 : true))
          .map((p) => ({ x: p.x, y: toDisplayY(p.rawY, mode), rawY: p.rawY })),
      })),
    [rawSeries, mode]
  );

  const displayPoints = useMemo(
    () => displaySeries.flatMap((s) => s.points),
    [displaySeries]
  );

  const xValues = useMemo(
    () => allRawPoints.map((p) => p.x).filter((v) => !Number.isNaN(v)),
    [allRawPoints]
  );

  const topMargin = (title ? BASE.top + 24 : BASE.top) + (crosshair ? CROSSHAIR_TOP_PAD : 0);
  const bottomMargin =
    BASE.bottom + (crosshair && onXSelect ? CROSSHAIR_BOTTOM_HINT : 0);
  const legendSpace = showLegend && series.length > 0 ? 36 : 0;
  const chartHeight = height - legendSpace;
  const innerHeight = chartHeight - topMargin - bottomMargin;

  const yScale = useMemo(() => {
    const yVals = displayPoints.map((p) => p.y).filter((v) => !Number.isNaN(v));
    if (mode === "log") {
      return scaleLog()
        .domain([min(yVals) ?? 1, max(yVals) ?? 10])
        .nice()
        .range([innerHeight, 0]);
    }
    return scaleLinear()
      .domain([min(yVals) ?? 0, max(yVals) ?? 1])
      .nice()
      .range([innerHeight, 0]);
  }, [displayPoints, mode, innerHeight]);

  const yAxisTicks = useMemo(() => {
    if (mode === "log") return (yScale as ReturnType<typeof scaleLog>).ticks(5);
    return (yScale as ReturnType<typeof scaleLinear>).ticks(5);
  }, [yScale, mode]);

  const leftMargin = useMemo(
    () => Math.max(52, estimateTickLabelWidth(yAxisTicks, mode)),
    [yAxisTicks, mode]
  );

  const innerWidth = width - leftMargin - BASE.right;

  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([min(xValues) ?? 0, max(xValues) ?? 1])
        .range([0, innerWidth]),
    [xValues, innerWidth]
  );

  const lineGenerator = useMemo(
    () =>
      line<{ x: number; y: number }>()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y)),
    [xScale, yScale]
  );

  const colorScale = useMemo(
    () =>
      scaleOrdinal<string, string>()
        .domain(series.map((s) => s.key))
        .range(series.map((_, i) => getColor(i))),
    [series]
  );

  const xAxisTicks = xScale.ticks(6);

  const guideX = hoverX ?? selectedX;
  const guidePx = guideX !== null ? xScale(guideX) : null;
  const badgeWidth = 56;
  const badgeHeight = 20;
  const badgeX =
    guidePx !== null
      ? Math.min(innerWidth - badgeWidth / 2, Math.max(badgeWidth / 2, guidePx))
      : null;

  const handleCrosshairMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget;
    const svg = rect.ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = rect.getScreenCTM()?.inverse();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm);
    if (local.x < 0 || local.x > innerWidth) {
      setHoverX(null);
      return;
    }
    setHoverX(snapToNearestX(xScale.invert(local.x), xValues));
  };

  const handleCrosshairClick = () => {
    if (hoverX !== null && onXSelect) {
      onXSelect(hoverX);
    }
  };

  const showTooltip = (
    e: React.MouseEvent,
    key: string,
    rawY: number,
    dataX: number,
    px: number,
    py: number
  ) => {
    const svg = (e.currentTarget as Element).closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setActiveKey(key);
    setTooltip({ key, rawY, dataX, x: px - rect.left, y: py - rect.top });
  };

  if (series.length === 0 || allRawPoints.length === 0) {
    return (
      <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Configure dataset and columns to render the line chart.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 0.5, textAlign: "center", fontWeight: 600 }}>
          {title}
        </Typography>
      )}

      <Box sx={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg
          width={width}
          height={chartHeight}
          role="img"
          aria-label={title || "Line chart"}
          style={{ overflow: "visible" }}
        >
          <g transform={`translate(${leftMargin},${topMargin})`}>
            {yAxisTicks.map((tick) => (
              <line
                key={`grid-${tick}`}
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#e0e0e0"
              />
            ))}

            {displaySeries.map((s) => {
              const isActive = activeKey === s.key;
              const isDimmed = activeKey !== null && !isActive;
              const path = lineGenerator(s.points);
              if (!path) return null;
              return (
                <g key={s.key}>
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={12}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      const mid = s.points[Math.floor(s.points.length / 2)];
                      if (mid)
                        showTooltip(
                          e,
                          s.key,
                          mid.rawY,
                          mid.x,
                          xScale(mid.x) + leftMargin,
                          yScale(mid.y) + topMargin
                        );
                    }}
                    onMouseLeave={() => {
                      setActiveKey(null);
                      setTooltip(null);
                    }}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={colorScale(s.key)}
                    strokeWidth={isActive ? 3.5 : 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transition: "stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease",
                      opacity: isDimmed ? 0.25 : 1,
                      filter: isActive ? "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" : "none",
                      pointerEvents: "none",
                    }}
                  />
                </g>
              );
            })}

            {displaySeries.flatMap((s) => {
              const isActive = activeKey === s.key;
              const isDimmed = activeKey !== null && !isActive;
              return s.points.map((point, i) => (
                <circle
                  key={`${s.key}-${i}`}
                  cx={xScale(point.x)}
                  cy={yScale(point.y)}
                  r={isActive ? 5 : 3}
                  fill={colorScale(s.key)}
                  stroke="#fff"
                  strokeWidth={isActive ? 2 : 0}
                  style={{
                    transition: "r 0.2s ease, opacity 0.2s ease",
                    opacity: isDimmed ? 0.25 : 1,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    showTooltip(
                      e,
                      s.key,
                      point.rawY,
                      point.x,
                      xScale(point.x) + leftMargin,
                      yScale(point.y) + topMargin
                    )
                  }
                  onMouseLeave={() => {
                    setActiveKey(null);
                    setTooltip(null);
                  }}
                />
              ));
            })}

            <g transform={`translate(0,${innerHeight})`}>
              {xAxisTicks.map((tick) => (
                <g key={`x-${tick}`} transform={`translate(${xScale(tick)},0)`}>
                  <line y2={6} stroke="#666" />
                  <text y={20} textAnchor="middle" fontSize={11} fill="#666">
                    {tick}
                  </text>
                </g>
              ))}
              {xLabel && (
                <text
                  x={innerWidth / 2}
                  y={36}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#444"
                >
                  {xLabel}
                </text>
              )}
              {crosshair && onXSelect && hoverX !== null && (
                <text
                  x={innerWidth / 2}
                  y={56}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#666"
                >
                  Click to set pie chart to {xLabel || "X"} = {hoverX}
                </text>
              )}
            </g>

            <g>
              {yAxisTicks.map((tick) => (
                <g key={`y-${tick}`} transform={`translate(0,${yScale(tick)})`}>
                  <line x2={-6} stroke="#666" />
                  <text x={-10} dy="0.32em" textAnchor="end" fontSize={11} fill="#666">
                    {formatYTickDisplay(tick, mode)}
                  </text>
                </g>
              ))}
              <text
                transform="rotate(-90)"
                x={-innerHeight / 2}
                y={-leftMargin + 14}
                textAnchor="middle"
                fontSize={12}
                fill="#444"
              >
                {yLabel}
              </text>
            </g>

            {crosshair && badgeX !== null && guideX !== null && (
              <g pointerEvents="none">
                <line
                  x1={badgeX}
                  x2={badgeX}
                  y1={0}
                  y2={innerHeight}
                  stroke={hoverX !== null ? "#1565c0" : "#e65100"}
                  strokeWidth={hoverX !== null ? 1.5 : 2}
                  strokeDasharray={hoverX !== null ? "4 3" : "6 4"}
                  opacity={0.85}
                />
                <rect
                  x={badgeX - badgeWidth / 2}
                  y={-CROSSHAIR_TOP_PAD + 2}
                  width={badgeWidth}
                  height={badgeHeight}
                  rx={4}
                  fill={hoverX !== null ? "#1565c0" : "#e65100"}
                />
                <text
                  x={badgeX}
                  y={-CROSSHAIR_TOP_PAD + 16}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#fff"
                  fontWeight={600}
                >
                  {guideX}
                </text>
              </g>
            )}

            {crosshair && (
              <rect
                x={0}
                y={0}
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                style={{ cursor: onXSelect ? "crosshair" : "default" }}
                onMouseMove={handleCrosshairMove}
                onMouseLeave={() => setHoverX(null)}
                onClick={handleCrosshairClick}
              />
            )}
          </g>
        </svg>

        {tooltip && (
          <Box
            sx={{
              position: "absolute",
              left: tooltip.x + 10,
              top: tooltip.y - 8,
              bgcolor: "rgba(0,0,0,0.82)",
              color: "#fff",
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
              fontSize: 12,
              pointerEvents: "none",
              zIndex: 10,
              whiteSpace: "nowrap",
              transform: "translateY(-100%)",
              boxShadow: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600, display: "block" }}>
              {tooltip.key}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
              {xLabel || "X"}: {tooltip.dataX} · {formatValue(tooltip.rawY, yAxisScale)}
            </Typography>
          </Box>
        )}
      </Box>

      {showLegend && series.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1.5,
            mt: 0.5,
            width: "100%",
          }}
        >
          {series.map((s) => {
            const isActive = activeKey === s.key;
            const isDimmed = activeKey !== null && !isActive;
            return (
              <Box
                key={s.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  opacity: isDimmed ? 0.4 : 1,
                  cursor: "pointer",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={() => setActiveKey(s.key)}
                onMouseLeave={() => setActiveKey(null)}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 3,
                    borderRadius: 1,
                    bgcolor: colorScale(s.key),
                    transition: "height 0.2s ease",
                    ...(isActive && { height: 5 }),
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: isActive ? 600 : 400, transition: "font-weight 0.2s ease" }}
                >
                  {s.key}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
