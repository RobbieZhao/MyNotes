"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear, scaleOrdinal } from "d3";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import { getColor } from "@/lib/d3/colors";
import {
  formatValue,
  resolveYScaleMode,
  type PieValueScale,
} from "@/lib/d3/format";
import type { BarChartRaceFrame } from "@/lib/datasets/interpret";
import type { BarOrientation } from "@/types/blocks";

interface BarChartRaceProps {
  frames: BarChartRaceFrame[];
  title?: string;
  keyLabel?: string;
  valueLabel?: string;
  valueScale?: PieValueScale;
  orientation?: BarOrientation;
  maxBars?: number;
  showValues?: boolean;
  height?: number;
}

const BASE_FRAME_MS = 900;
const RANK_LERP = 0.18;
const LABEL_WIDTH = 120;
const VALUE_WIDTH = 72;
const CONTROLS_HEIGHT = 52;
const KEY_HEADER_HEIGHT = 52;
const BAR_SLOT = 30;

interface RankedBar {
  label: string;
  value: number;
  rank: number;
}

function interpolateFrameValues(
  frameA: BarChartRaceFrame,
  frameB: BarChartRaceFrame,
  t: number
): Map<string, number> {
  const labels = new Set([
    ...frameA.bars.map((b) => b.label),
    ...frameB.bars.map((b) => b.label),
  ]);
  const values = new Map<string, number>();
  for (const label of labels) {
    const a = frameA.bars.find((b) => b.label === label)?.value ?? 0;
    const b = frameB.bars.find((b) => b.label === label)?.value ?? 0;
    values.set(label, a + (b - a) * t);
  }
  return values;
}

function getFinalState(frames: BarChartRaceFrame[]): {
  displayKey: number;
  values: Map<string, number>;
} {
  const last = frames[frames.length - 1];
  return {
    displayKey: last.key,
    values: new Map(last.bars.map((b) => [b.label, b.value])),
  };
}

function getAnimationState(
  frames: BarChartRaceFrame[],
  timeMs: number,
  speed: number
): { displayKey: number; values: Map<string, number> } {
  if (frames.length === 0) return { displayKey: 0, values: new Map() };
  if (frames.length === 1) return getFinalState(frames);

  const frameMs = BASE_FRAME_MS / speed;
  const totalDuration = (frames.length - 1) * frameMs;
  const clampedTime = Math.min(timeMs, totalDuration);
  const frameFloat = clampedTime / frameMs;
  const frameIndex = Math.floor(frameFloat);
  const t = frameFloat - frameIndex;

  const frameA = frames[frameIndex];
  const frameB = frames[Math.min(frameIndex + 1, frames.length - 1)];
  const displayKey = frameA.key + (frameB.key - frameA.key) * t;

  return { displayKey, values: interpolateFrameValues(frameA, frameB, t) };
}

function rankBars(values: Map<string, number>, maxBars: number): RankedBar[] {
  return [...values.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxBars)
    .map(([label, value], rank) => ({ label, value, rank }));
}

export function BarChartRace({
  frames,
  title = "",
  keyLabel = "",
  valueLabel = "Value",
  valueScale = "auto",
  orientation = "horizontal",
  maxBars = 10,
  showValues = true,
  height = 420,
}: BarChartRaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(520);
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [timeMs, setTimeMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const displayRanksRef = useRef<Map<string, number>>(new Map());
  const activeSpeedRef = useRef(1);

  const resetPlayback = useCallback(() => {
    setTimeMs(0);
    setFinished(false);
    displayRanksRef.current = new Map();
  }, []);

  useEffect(() => {
    activeSpeedRef.current = 1;
    resetPlayback();
    setPlaying(true);
  }, [frames, resetPlayback]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(320, entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const globalMax = useMemo(() => {
    let peak = 1;
    for (const frame of frames) {
      for (const bar of frame.bars) {
        if (bar.value > peak) peak = bar.value;
      }
    }
    return peak;
  }, [frames]);

  const allLabels = useMemo(() => {
    const labels = new Set<string>();
    for (const frame of frames) {
      for (const bar of frame.bars) labels.add(bar.label);
    }
    return [...labels];
  }, [frames]);

  const colorScale = useMemo(
    () =>
      scaleOrdinal<string, string>()
        .domain(allLabels)
        .range(allLabels.map((_, i) => getColor(i))),
    [allLabels]
  );

  const scaleMode = useMemo(
    () => resolveYScaleMode(valueScale, globalMax),
    [valueScale, globalMax]
  );

  const tick = useCallback(
    (timestamp: number) => {
      if (lastTickRef.current === null) lastTickRef.current = timestamp;
      const delta = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      const playbackSpeed = activeSpeedRef.current;
      const totalDuration =
        frames.length > 1
          ? ((frames.length - 1) * BASE_FRAME_MS) / playbackSpeed
          : 0;

      setTimeMs((prev) => {
        const next = prev + delta;
        if (next >= totalDuration) {
          setFinished(true);
          setPlaying(false);
          return totalDuration;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [frames.length]
  );

  useEffect(() => {
    if (playing && !finished && frames.length > 1) {
      lastTickRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, finished, frames.length, tick]);

  const handlePlay = () => {
    if (finished) return;
    setPlaying(true);
  };

  const handlePause = () => setPlaying(false);

  const handleReplay = () => {
    activeSpeedRef.current = speed;
    resetPlayback();
    setPlaying(true);
  };

  const { displayKey, values } = finished
    ? getFinalState(frames)
    : getAnimationState(frames, timeMs, activeSpeedRef.current);

  const targetRanked = rankBars(values, maxBars);

  const ranked = (() => {
    const targetRanks = new Map(targetRanked.map((b, i) => [b.label, i]));

    if (finished) {
      displayRanksRef.current = targetRanks;
      return targetRanked.map((bar) => ({ ...bar, displayRank: bar.rank }));
    }

    const nextRanks = new Map<string, number>();
    for (const [label, target] of targetRanks) {
      const current = displayRanksRef.current.get(label) ?? target;
      const diff = target - current;
      const next =
        Math.abs(diff) < 0.01 ? target : current + diff * RANK_LERP;
      nextRanks.set(label, next);
    }
    displayRanksRef.current = nextRanks;

    return targetRanked.map((bar) => ({
      ...bar,
      displayRank: nextRanks.get(bar.label) ?? bar.rank,
    }));
  })();

  const layoutBarCount = useMemo(() => {
    if (frames.length === 0) return 1;
    let peak = 1;
    for (const frame of frames) {
      peak = Math.max(peak, Math.min(frame.bars.length, maxBars));
    }
    return peak;
  }, [frames, maxBars]);

  const chartHeight = useMemo(() => {
    const barAreaHeight = layoutBarCount * BAR_SLOT;
    if (orientation === "horizontal") {
      return 8 + KEY_HEADER_HEIGHT + barAreaHeight + 8;
    }
    return height - CONTROLS_HEIGHT;
  }, [layoutBarCount, orientation, height]);
  const isHorizontal = orientation === "horizontal";

  const margin = isHorizontal
    ? { top: 8, right: 16, bottom: 8, left: LABEL_WIDTH + 8 }
    : { top: KEY_HEADER_HEIGHT + 8, right: 16, bottom: 44, left: 48 };

  const innerWidth =
    width - margin.left - margin.right - (isHorizontal && showValues ? VALUE_WIDTH : 0);
  const innerHeight = chartHeight - margin.top - margin.bottom;
  const barAreaHeight = isHorizontal ? layoutBarCount * BAR_SLOT : innerHeight;
  const barSlot = isHorizontal ? BAR_SLOT : layoutBarCount > 0 ? innerWidth / layoutBarCount : 0;
  const barThickness = Math.max(14, barSlot * 0.72);

  const valueScaleFn = useMemo(
    () =>
      scaleLinear()
        .domain([0, globalMax])
        .range(isHorizontal ? [0, innerWidth] : [innerHeight, 0]),
    [globalMax, innerWidth, innerHeight, isHorizontal]
  );

  const getBarPosition = (displayRank: number, isHoriz: boolean) => {
    if (isHoriz) {
      return (
        KEY_HEADER_HEIGHT +
        displayRank * barSlot +
        (barSlot - barThickness) / 2
      );
    }
    const thickness = Math.max(14, barSlot * 0.72);
    return displayRank * barSlot + (barSlot - thickness) / 2;
  };

  const getBarThickness = (isHoriz: boolean) => {
    if (isHoriz) return barThickness;
    return Math.max(14, barSlot * 0.72);
  };

  if (frames.length === 0) {
    return (
      <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Configure dataset and columns to render the bar chart race.
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ width: "100%" }}>
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 0.5, textAlign: "center", fontWeight: 600 }}>
          {title}
        </Typography>
      )}

      <svg
        width={width}
        height={chartHeight}
        role="img"
        aria-label={title || "Bar chart race"}
        style={{ overflow: "visible" }}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {isHorizontal && (
            <g pointerEvents="none">
              <text
                x={innerWidth}
                y={18}
                textAnchor="end"
                fontSize={28}
                fontWeight={700}
                fill="#333"
              >
                {Math.round(displayKey)}
              </text>
              {keyLabel && (
                <text
                  x={innerWidth}
                  y={36}
                  textAnchor="end"
                  fontSize={11}
                  fill="#888"
                >
                  {keyLabel}
                </text>
              )}
            </g>
          )}

          {!isHorizontal && (
            <g pointerEvents="none">
              <text
                x={innerWidth / 2}
                y={-12}
                textAnchor="middle"
                fontSize={28}
                fontWeight={700}
                fill="#333"
              >
                {Math.round(displayKey)}
              </text>
              {keyLabel && (
                <text
                  x={innerWidth / 2}
                  y={4}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#888"
                >
                  {keyLabel}
                </text>
              )}
            </g>
          )}

          {isHorizontal
            ? ranked.map((bar) => {
                const y = getBarPosition(bar.displayRank, true);
                const barWidth = valueScaleFn(bar.value);
                return (
                  <g key={bar.label}>
                    <text
                      x={-8}
                      y={y + barThickness / 2}
                      dy="0.32em"
                      textAnchor="end"
                      fontSize={12}
                      fill="#444"
                      fontWeight={500}
                    >
                      {bar.label}
                    </text>
                    <rect
                      x={0}
                      y={y}
                      width={Math.max(0, barWidth)}
                      height={barThickness}
                      fill={colorScale(bar.label)}
                      rx={3}
                    />
                    {showValues && (
                      <text
                        x={barWidth + 6}
                        y={y + barThickness / 2}
                        dy="0.32em"
                        fontSize={11}
                        fill="#666"
                      >
                        {formatValue(bar.value, valueScale)}
                      </text>
                    )}
                  </g>
                );
              })
            : ranked.map((bar) => {
                const thickness = getBarThickness(false);
                const x = getBarPosition(bar.displayRank, false);
                const barHeight = innerHeight - valueScaleFn(bar.value);
                return (
                  <g key={bar.label}>
                    <rect
                      x={x}
                      y={valueScaleFn(bar.value)}
                      width={thickness}
                      height={Math.max(0, barHeight)}
                      fill={colorScale(bar.label)}
                      rx={3}
                    />
                    <text
                      x={x + thickness / 2}
                      y={innerHeight + 16}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#444"
                      transform={
                        thickness < 48
                          ? `rotate(-40, ${x + thickness / 2}, ${innerHeight + 16})`
                          : undefined
                      }
                    >
                      {bar.label}
                    </text>
                    {showValues && barHeight > 18 && (
                      <text
                        x={x + thickness / 2}
                        y={valueScaleFn(bar.value) - 4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#666"
                      >
                        {formatValue(bar.value, valueScale)}
                      </text>
                    )}
                  </g>
                );
              })}

          {!isHorizontal && (
            <g>
              {valueScaleFn.ticks(5).map((tick) => (
                <g key={tick}>
                  <line
                    x1={0}
                    x2={innerWidth}
                    y1={valueScaleFn(tick)}
                    y2={valueScaleFn(tick)}
                    stroke="#e8e8e8"
                  />
                  <text
                    x={-8}
                    y={valueScaleFn(tick)}
                    dy="0.32em"
                    textAnchor="end"
                    fontSize={10}
                    fill="#888"
                  >
                    {formatValue(tick, scaleMode)}
                  </text>
                </g>
              ))}
              <text
                transform="rotate(-90)"
                x={-innerHeight / 2}
                y={-36}
                textAnchor="middle"
                fontSize={11}
                fill="#666"
              >
                {valueLabel}
              </text>
            </g>
          )}
        </g>
      </svg>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mt: 0.5,
          height: CONTROLS_HEIGHT,
        }}
      >
        {finished ? (
          <IconButton size="small" onClick={handleReplay} aria-label="Replay">
            <ReplayIcon />
          </IconButton>
        ) : playing ? (
          <IconButton size="small" onClick={handlePause} aria-label="Pause">
            <PauseIcon />
          </IconButton>
        ) : (
          <IconButton size="small" onClick={handlePlay} aria-label="Play">
            <PlayArrowIcon />
          </IconButton>
        )}

        <Typography variant="caption" color="text.secondary">
          Speed
        </Typography>
        <Slider
          size="small"
          value={speed}
          min={0.25}
          max={4}
          step={0.25}
          onChange={(_, v) => setSpeed(v as number)}
          sx={{ width: 140 }}
          aria-label="Animation speed"
        />
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 28 }}>
          {speed}×
        </Typography>
      </Box>
    </Box>
  );
}
