"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { arc as d3Arc, pie, scaleOrdinal, sum, type PieArcDatum } from "d3";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getColor } from "@/lib/d3/colors";
import { formatValue, type PieValueScale } from "@/lib/d3/format";
import type { PieChartSlice } from "@/lib/datasets/interpret";

interface PieChartProps {
  slices: PieChartSlice[];
  title?: string;
  subtitle?: string;
  valueScale?: PieValueScale;
  showLegend?: boolean;
  showLabels?: boolean;
  size?: number;
}

const HOVER_OFFSET = 14;
const HOVER_SCALE = 1.06;

export function PieChart({
  slices,
  title = "",
  subtitle,
  valueScale = "auto",
  showLegend = true,
  showLabels = true,
  size = 300,
}: PieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(size);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    label: string;
    value: number;
    percent: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setWidth(Math.min(Math.max(260, w), 420));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chartSize = Math.min(width, size);
  const radius = chartSize / 2 - 24;
  const center = chartSize / 2;

  const pieData = useMemo(() => {
    const generator = pie<PieChartSlice>()
      .value((d) => d.value)
      .sort(null);
    return generator(slices);
  }, [slices]);

  const total = useMemo(() => sum(slices, (d) => d.value), [slices]);

  const colorScale = useMemo(
    () =>
      scaleOrdinal<string, string>()
        .domain(slices.map((d) => d.label))
        .range(slices.map((_, i) => getColor(i))),
    [slices]
  );

  const arcGen = useMemo(
    () => d3Arc<PieArcDatum<PieChartSlice>>().innerRadius(0).outerRadius(radius),
    [radius]
  );

  const hoverArcGen = useMemo(
    () =>
      d3Arc<PieArcDatum<PieChartSlice>>().innerRadius(0).outerRadius(radius * HOVER_SCALE),
    [radius]
  );

  const getOffset = (slice: PieArcDatum<PieChartSlice>, isActive: boolean) => {
    if (!isActive) return { dx: 0, dy: 0 };
    const mid = (slice.startAngle + slice.endAngle) / 2;
    return {
      dx: Math.sin(mid) * HOVER_OFFSET,
      dy: -Math.cos(mid) * HOVER_OFFSET,
    };
  };

  if (slices.length === 0) {
    return (
      <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Configure dataset and columns to render the pie chart.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 0.5, textAlign: "center", fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="caption" color="primary" sx={{ mb: 0.5, textAlign: "center", display: "block" }}>
          {subtitle}
        </Typography>
      )}

      <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <svg width={chartSize} height={chartSize} role="img" aria-label={title || "Pie chart"}>
          <g transform={`translate(${center},${center})`}>
            {pieData.map((slice) => {
              const isActive = activeLabel === slice.data.label;
              const isDimmed = activeLabel !== null && !isActive;
              const { dx, dy } = getOffset(slice, isActive);
              const path = (isActive ? hoverArcGen : arcGen)(slice) ?? "";
              const [lx, ly] = arcGen.centroid(slice);
              const percent = total > 0 ? (slice.data.value / total) * 100 : 0;
              const showSliceLabel = showLabels && percent >= 4;

              return (
                <g
                  key={slice.data.label}
                  transform={`translate(${dx},${dy})`}
                  style={{
                    transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    setActiveLabel(slice.data.label);
                    const rect = (e.currentTarget.closest("svg") as SVGElement).getBoundingClientRect();
                    setTooltip({
                      label: slice.data.label,
                      value: slice.data.value,
                      percent,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = (e.currentTarget.closest("svg") as SVGElement).getBoundingClientRect();
                    setTooltip({
                      label: slice.data.label,
                      value: slice.data.value,
                      percent,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseLeave={() => {
                    setActiveLabel(null);
                    setTooltip(null);
                  }}
                >
                  <path
                    d={path}
                    fill={colorScale(slice.data.label)}
                    stroke="#fff"
                    strokeWidth={isActive ? 2 : 1}
                    style={{
                      transition: "opacity 0.2s ease, filter 0.2s ease",
                      opacity: isDimmed ? 0.45 : 1,
                      filter: isActive ? "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" : "none",
                    }}
                  />
                  {showSliceLabel && (
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={percent >= 10 ? 12 : 10}
                      fontWeight={600}
                      fill="#fff"
                      style={{
                        pointerEvents: "none",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        opacity: isDimmed ? 0.6 : 1,
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      {percent.toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {tooltip && (
          <Box
            sx={{
              position: "absolute",
              left: tooltip.x + 12,
              top: tooltip.y - 8,
              bgcolor: "rgba(0,0,0,0.82)",
              color: "#fff",
              px: 1.5,
              py: 1,
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
              {tooltip.label}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
              {formatValue(tooltip.value, valueScale)} ({tooltip.percent.toFixed(1)}%)
            </Typography>
          </Box>
        )}
      </Box>

      {showLegend && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1.5,
            mt: 1,
            width: "100%",
            px: 1,
          }}
        >
          {slices.map((entry) => {
            const percent = total > 0 ? (entry.value / total) * 100 : 0;
            const isActive = activeLabel === entry.label;
            const isDimmed = activeLabel !== null && !isActive;
            return (
              <Box
                key={entry.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  opacity: isDimmed ? 0.45 : 1,
                  transition: "opacity 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setActiveLabel(entry.label)}
                onMouseLeave={() => setActiveLabel(null)}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: colorScale(entry.label),
                    transform: isActive ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.2s ease",
                  }}
                />
                <Typography variant="caption">
                  {entry.label}: {formatValue(entry.value, valueScale)} ({percent.toFixed(1)}%)
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
