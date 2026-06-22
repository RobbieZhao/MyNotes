"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  geoAlbersUsa,
  geoNaturalEarth1,
  geoPath,
  interpolateBlues,
  interpolateGnBu,
  interpolateOrRd,
  interpolatePurples,
  interpolateViridis,
  max,
  min,
  scaleSequential,
  select,
  zoom,
  zoomIdentity,
  type GeoPermissibleObjects,
  type ZoomBehavior,
  type ZoomTransform,
} from "d3";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import { formatValue, type PieValueScale } from "@/lib/d3/format";
import type { ChoroplethMapFrame, ChoroplethRegion } from "@/lib/datasets/interpret";
import { getRegionDisplayName } from "@/lib/geo/regions";
import { loadMapGeo, type MapGeoCollection } from "@/lib/geo/loadMap";
import type { ChoroplethColorScheme, MapRegion } from "@/types/blocks";

interface ChoroplethMapProps {
  regions: ChoroplethRegion[];
  frames?: ChoroplethMapFrame[];
  mapRegion?: MapRegion;
  keyLabel?: string;
  title?: string;
  subtitle?: string;
  valueScale?: PieValueScale;
  showLegend?: boolean;
  colorScheme?: ChoroplethColorScheme;
  enableAnimation?: boolean;
  highlightedLabels?: string[];
  height?: number;
}

const LEGEND_WIDTH = 200;
const LEGEND_HEIGHT = 12;
const CONTROLS_HEIGHT = 56;
const MARGIN = { top: 8, right: 16, bottom: 8, left: 16 };
const BASE_FRAME_MS = 900;
const NO_DATA_COLOR = "#e8ecf0";
const OCEAN_GRADIENT = "url(#choropleth-ocean-gradient)";

const US_LAND_GRADIENT = "url(#choropleth-us-gradient)";

type MapFeature = Feature<Geometry, { name: string }>;

const COLOR_INTERPOLATORS: Record<
  ChoroplethColorScheme,
  (t: number) => string
> = {
  blues: interpolateBlues,
  teal: interpolateGnBu,
  orange: interpolateOrRd,
  purple: interpolatePurples,
  viridis: interpolateViridis,
};

function buildValueMap(regions: ChoroplethRegion[]): Map<string, ChoroplethRegion> {
  return new Map(regions.map((r) => [r.id, r]));
}

function interpolateRegions(
  frameA: ChoroplethMapFrame,
  frameB: ChoroplethMapFrame,
  t: number,
  mapRegion: MapRegion
): ChoroplethRegion[] {
  const labels = new Set([
    ...frameA.regions.map((r) => r.id),
    ...frameB.regions.map((r) => r.id),
  ]);
  const mapA = buildValueMap(frameA.regions);
  const mapB = buildValueMap(frameB.regions);
  const regions: ChoroplethRegion[] = [];

  for (const id of labels) {
    const a = mapA.get(id);
    const b = mapB.get(id);
    const valueA = a?.value ?? 0;
    const valueB = b?.value ?? 0;
    regions.push({
      id,
      label: b?.label ?? a?.label ?? getRegionDisplayName(id, mapRegion),
      value: valueA + (valueB - valueA) * t,
    });
  }

  return regions;
}

function getAnimationState(
  frames: ChoroplethMapFrame[],
  timeMs: number,
  speed: number,
  mapRegion: MapRegion
): { displayKey: number; regions: ChoroplethRegion[] } {
  if (frames.length === 0) return { displayKey: 0, regions: [] };
  if (frames.length === 1) {
    return { displayKey: frames[0].key, regions: frames[0].regions };
  }

  const frameMs = BASE_FRAME_MS / speed;
  const totalDuration = (frames.length - 1) * frameMs;
  const clampedTime = Math.min(timeMs, totalDuration);
  const frameFloat = clampedTime / frameMs;
  const frameIndex = Math.floor(frameFloat);
  const t = frameFloat - frameIndex;
  const frameA = frames[frameIndex];
  const frameB = frames[Math.min(frameIndex + 1, frames.length - 1)];

  return {
    displayKey: frameA.key + (frameB.key - frameA.key) * t,
    regions: interpolateRegions(frameA, frameB, t, mapRegion),
  };
}

export function ChoroplethMap({
  regions,
  frames = [],
  mapRegion = "world",
  keyLabel = "Year",
  title = "",
  subtitle,
  valueScale = "auto",
  showLegend = true,
  colorScheme = "blues",
  enableAnimation = true,
  highlightedLabels = [],
  height = 480,
}: ChoroplethMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [width, setWidth] = useState(720);
  const [mapGeo, setMapGeo] = useState<MapGeoCollection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    value: number | null;
    x: number;
    y: number;
  } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [timeMs, setTimeMs] = useState(0);
  const [zoomTransform, setZoomTransform] = useState<ZoomTransform>(zoomIdentity);

  const canAnimate = enableAnimation && frames.length > 1;

  useEffect(() => {
    setMapGeo(null);
    setLoadError(null);
    setHoveredId(null);
    setTooltip(null);
    setPlaying(false);
    setFinished(false);
    setTimeMs(0);
    setZoomTransform(zoomIdentity);

    loadMapGeo(mapRegion)
      .then(setMapGeo)
      .catch(() => setLoadError("Could not load map data."));
  }, [mapRegion]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(320, entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !canAnimate) return;
    let raf = 0;
    let last = performance.now();
    const frameMs = BASE_FRAME_MS / speed;
    const totalDuration = (frames.length - 1) * frameMs;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setTimeMs((prev) => {
        const next = prev + dt;
        if (next >= totalDuration) {
          setPlaying(false);
          setFinished(true);
          return totalDuration;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, canAnimate, frames.length, speed]);

  useEffect(() => {
    const svg = svgRef.current;
    const mapGroup = mapGroupRef.current;
    if (!svg || !mapGroup || !mapGeo) return;

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
        select(mapGroup).attr("transform", event.transform.toString());
      });

    zoomRef.current = behavior;
    select(svg).call(behavior);
    return () => {
      select(svg).on(".zoom", null);
    };
  }, [mapGeo]);

  const activeRegions = useMemo(() => {
    if (canAnimate && (playing || finished || timeMs > 0)) {
      return getAnimationState(frames, timeMs, speed, mapRegion).regions;
    }
    return regions;
  }, [canAnimate, playing, finished, timeMs, speed, frames, regions, mapRegion]);

  const displayKey = useMemo(() => {
    if (canAnimate && (playing || finished || timeMs > 0)) {
      return getAnimationState(frames, timeMs, speed, mapRegion).displayKey;
    }
    return null;
  }, [canAnimate, playing, finished, timeMs, speed, frames, mapRegion]);

  const valueById = useMemo(() => buildValueMap(activeRegions), [activeRegions]);

  const highlightedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const label of highlightedLabels) {
      for (const region of activeRegions) {
        if (region.label === label) ids.add(region.id);
      }
    }
    return ids;
  }, [highlightedLabels, activeRegions]);

  const { colorScale, domainMin, domainMax } = useMemo(() => {
    const values = activeRegions.map((r) => r.value).filter((v) => v > 0);
    const lo = values.length ? (min(values) ?? 0) : 0;
    const hi = values.length ? (max(values) ?? 1) : 1;
    const scale = scaleSequential(COLOR_INTERPOLATORS[colorScheme]).domain([lo, hi]);
    return { colorScale: scale, domainMin: lo, domainMax: hi };
  }, [activeRegions, colorScheme]);

  const mapWidth = width - MARGIN.left - MARGIN.right;
  const mapHeight =
    height - MARGIN.top - MARGIN.bottom - (canAnimate ? CONTROLS_HEIGHT : 0) - (showLegend ? 48 : 0);

  const projection = useMemo(() => {
    const geo = mapGeo ?? { type: "Sphere" as const };
    if (mapRegion === "usa") {
      return geoAlbersUsa().fitSize([mapWidth, mapHeight], geo);
    }
    return geoNaturalEarth1().fitSize([mapWidth, mapHeight], geo);
  }, [mapWidth, mapHeight, mapGeo, mapRegion]);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const resetZoom = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !zoomRef.current) return;
    select(svg)
      .transition()
      .duration(400)
      .call(zoomRef.current.transform, zoomIdentity);
    setZoomTransform(zoomIdentity);
  }, []);

  const handlePlayPause = () => {
    if (finished) {
      setTimeMs(0);
      setFinished(false);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  const handleSliderChange = (_: unknown, value: number | number[]) => {
    const v = Array.isArray(value) ? value[0] : value;
    setTimeMs(v);
    setPlaying(false);
    setFinished(v >= (frames.length - 1) * (BASE_FRAME_MS / speed));
  };

  const handleRegionEnter = (
    feature: MapFeature,
    event: ReactMouseEvent<SVGPathElement>
  ) => {
    const id = String(feature.id ?? "");
    const region = valueById.get(id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredId(id);
    setTooltip({
      name: region?.label ?? feature.properties?.name ?? getRegionDisplayName(id, mapRegion),
      value: region?.value ?? null,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleCountryMove = (event: ReactMouseEvent<SVGPathElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !tooltip) return;
    setTooltip((prev) =>
      prev ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top } : null
    );
  };

  const handleCountryLeave = () => {
    setHoveredId(null);
    setTooltip(null);
  };

  const legendTicks = useMemo(() => {
    if (domainMax <= domainMin) return [domainMin];
    return [domainMin, (domainMin + domainMax) / 2, domainMax];
  }, [domainMin, domainMax]);

  const totalDuration = canAnimate ? (frames.length - 1) * (BASE_FRAME_MS / speed) : 0;

  if (loadError) {
    return (
      <Box sx={{ p: 2, border: "1px dashed", borderColor: "error.main", borderRadius: 1 }}>
        <Typography variant="body2" color="error">
          {loadError}
        </Typography>
      </Box>
    );
  }

  if (!mapGeo) {
    return (
      <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Loading {mapRegion === "usa" ? "US states" : "world"} map…
        </Typography>
      </Box>
    );
  }

  if (regions.length === 0 && frames.length === 0) {
    return (
      <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Configure dataset and columns to render the choropleth map.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        position: "relative",
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {(title || subtitle || displayKey !== null) && (
        <Box sx={{ px: 2, pt: 2, pb: 0.5, textAlign: "center" }}>
          {title && (
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="primary" sx={{ display: "block" }}>
              {subtitle}
            </Typography>
          )}
          {displayKey !== null && (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                color: "primary.main",
                lineHeight: 1.1,
                mt: 0.5,
              }}
            >
              {Math.round(displayKey)}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ position: "relative" }}>
        <Tooltip title="Reset zoom">
          <IconButton
            size="small"
            onClick={resetZoom}
            aria-label="Reset zoom"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 1,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <ZoomOutMapIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <svg
          ref={svgRef}
          width={width}
          height={height - (canAnimate ? CONTROLS_HEIGHT : 0) - (showLegend ? 48 : 0) + MARGIN.top + MARGIN.bottom}
          role="img"
          aria-label={title || "Choropleth map"}
          style={{ display: "block", cursor: zoomTransform.k > 1 ? "grab" : "default" }}
        >
          <defs>
            <linearGradient id="choropleth-ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dce8f5" />
              <stop offset="100%" stopColor="#b8cfe8" />
            </linearGradient>
            <linearGradient id="choropleth-us-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5f7fa" />
              <stop offset="100%" stopColor="#e8edf2" />
            </linearGradient>
            <filter id="choropleth-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#1565c0" floodOpacity="0.55" />
            </filter>
          </defs>

          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={mapWidth}
            height={mapHeight}
            fill={mapRegion === "usa" ? US_LAND_GRADIENT : OCEAN_GRADIENT}
            rx={8}
          />

          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            <g ref={mapGroupRef}>
              {(mapGeo.features as MapFeature[]).map((regionFeature) => {
                const id = String(regionFeature.id ?? "");
                const region = valueById.get(id);
                const isHovered = hoveredId === id;
                const isHighlighted = highlightedIds.has(id);
                const isDimmed =
                  highlightedIds.size > 0 && !isHighlighted && !isHovered;
                const fill = region && region.value > 0 ? colorScale(region.value) : NO_DATA_COLOR;
                const d = pathGenerator(regionFeature as GeoPermissibleObjects) ?? "";

                return (
                  <path
                    key={id || regionFeature.properties?.name}
                    d={d}
                    fill={fill}
                    stroke={
                      isHighlighted
                        ? "#ff9800"
                        : isHovered
                          ? "#1565c0"
                          : "#fff"
                    }
                    strokeWidth={isHighlighted ? 2 : isHovered ? 1.5 : mapRegion === "usa" ? 0.6 : 0.4}
                    opacity={isDimmed ? 0.35 : 1}
                    filter={isHovered ? "url(#choropleth-glow)" : undefined}
                    style={{
                      transition: "fill 0.45s ease, opacity 0.25s ease, stroke-width 0.2s ease",
                      cursor: region ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => handleRegionEnter(regionFeature, e)}
                    onMouseMove={handleCountryMove}
                    onMouseLeave={handleCountryLeave}
                  />
                );
              })}
            </g>
          </g>
        </svg>

        {tooltip && (
          <Box
            sx={{
              position: "absolute",
              left: tooltip.x + 14,
              top: tooltip.y - 8,
              pointerEvents: "none",
              zIndex: 10,
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              bgcolor: "rgba(18, 24, 38, 0.92)",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
              backdropFilter: "blur(8px)",
              minWidth: 120,
              transform: "translateY(-100%)",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
              {tooltip.name}
            </Typography>
            <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {tooltip.value !== null
                ? formatValue(tooltip.value, valueScale)
                : "No data"}
            </Typography>
          </Box>
        )}
      </Box>

      {showLegend && domainMax > domainMin && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 1.5,
            px: 3,
            pb: canAnimate ? 0 : 2,
            pt: 0.5,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ pt: 0.25, flexShrink: 0 }}
          >
            Low
          </Typography>
          <Box sx={{ flex: "1 1 auto", maxWidth: LEGEND_WIDTH + 24, minWidth: 0 }}>
            <svg
              width="100%"
              height={LEGEND_HEIGHT + 24}
              viewBox={`0 0 ${LEGEND_WIDTH + 16} ${LEGEND_HEIGHT + 24}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <linearGradient id="choropleth-legend-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <stop
                      key={t}
                      offset={`${t * 100}%`}
                      stopColor={colorScale(domainMin + (domainMax - domainMin) * t)}
                    />
                  ))}
                </linearGradient>
              </defs>
              <rect
                x={8}
                y={0}
                width={LEGEND_WIDTH}
                height={LEGEND_HEIGHT}
                rx={4}
                fill="url(#choropleth-legend-gradient)"
                stroke="#ccc"
                strokeWidth={0.5}
              />
              {legendTicks.map((tick, i) => {
                const x =
                  domainMax === domainMin
                    ? LEGEND_WIDTH / 2 + 8
                    : ((tick - domainMin) / (domainMax - domainMin)) * LEGEND_WIDTH + 8;
                const isFirst = i === 0;
                const isLast = i === legendTicks.length - 1;
                return (
                  <text
                    key={i}
                    x={x}
                    y={LEGEND_HEIGHT + 16}
                    textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
                    fontSize={10}
                    fill="#666"
                  >
                    {formatValue(tick, valueScale)}
                  </text>
                );
              })}
            </svg>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ pt: 0.25, flexShrink: 0 }}
          >
            High
          </Typography>
        </Box>
      )}

      {canAnimate && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <IconButton size="small" onClick={handlePlayPause} aria-label={playing ? "Pause" : "Play"}>
            {finished ? <ReplayIcon /> : playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Slider
            size="small"
            min={0}
            max={totalDuration}
            value={timeMs}
            onChange={handleSliderChange}
            sx={{ flex: 1 }}
            aria-label={`${keyLabel} scrubber`}
          />
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 48, textAlign: "right" }}>
            {speed}x
          </Typography>
          <Slider
            size="small"
            min={0.5}
            max={3}
            step={0.5}
            value={speed}
            onChange={(_, v) => setSpeed(Array.isArray(v) ? v[0] : v)}
            sx={{ width: 80 }}
            aria-label="Animation speed"
          />
        </Box>
      )}
    </Box>
  );
}
