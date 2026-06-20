"use client";

import { useCallback } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import StarIcon from "@mui/icons-material/Star";
import { Caveat } from "next/font/google";
import { keyframes } from "@mui/material/styles";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";
import {
  accentForItem,
  createTimelineItem,
  deleteTimelineItem,
  moveTimelineItem,
  normalizeTimelineData,
  TIMELINE_STATUS_LABELS,
  updateTimelineItem,
} from "@/lib/timeline/items";
import type { TimelineBlockData, TimelineItem, TimelineItemStatus } from "@/types/blocks";
import type { BlockRow } from "@/types/database";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "600", "700"] });

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
`;

const drawLine = keyframes`
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
`;

function TimelineNode({
  status,
  accent,
  isLast,
  animate,
}: {
  status: TimelineItemStatus;
  accent: ReturnType<typeof accentForItem>;
  isLast: boolean;
  animate: boolean;
}) {
  const isMilestone = status === "milestone";
  const isHighlight = status === "highlight";

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 28,
        flexShrink: 0,
      }}
    >
      <Box sx={{ position: "relative", width: isHighlight ? 22 : 18, height: isHighlight ? 22 : 18 }}>
        {(isHighlight || isMilestone) && (
          <Box
            sx={{
              position: "absolute",
              inset: -4,
              borderRadius: isMilestone ? "4px" : "50%",
              border: `2px solid ${accent.main}`,
              animation: animate ? `${pulseRing} 2.4s ease-out infinite` : "none",
            }}
          />
        )}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: isMilestone ? "4px" : "50%",
            bgcolor: accent.main,
            boxShadow: `0 0 0 3px #fff, 0 0 0 5px ${accent.light}, 0 2px 8px ${accent.glow}`,
            transform: isMilestone ? "rotate(45deg)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {isMilestone && (
            <StarIcon
              sx={{
                fontSize: 10,
                color: "#fff",
                transform: "rotate(-45deg)",
              }}
            />
          )}
        </Box>
      </Box>
      {!isLast && (
        <Box
          sx={{
            width: 3,
            flex: 1,
            minHeight: 24,
            mt: 0.5,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${accent.main} 0%, ${accent.light} 100%)`,
            transformOrigin: "top",
            animation: animate ? `${drawLine} 0.6s ease-out forwards` : "none",
          }}
        />
      )}
    </Box>
  );
}

function TimelineItemRow({
  item,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  item: TimelineItem;
  index: number;
  total: number;
  onChange: (id: string, patch: Partial<Omit<TimelineItem, "id">>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  const status = item.status ?? "default";
  const accent = accentForItem(index, status);
  const isLast = index === total - 1;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        animation: `${fadeSlideIn} 0.5s ease-out both`,
        animationDelay: `${index * 0.08}s`,
        "&:hover .timeline-actions": { opacity: 1 },
      }}
    >
      <Box sx={{ width: 72, flexShrink: 0, pt: 0.25, textAlign: "right" }}>
        <InputBase
          value={item.date}
          onChange={(e) => onChange(item.id, { date: e.target.value })}
          placeholder="Date"
          sx={{
            width: "100%",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: accent.main,
            fontFamily: "var(--font-geist-mono), monospace",
            "& .MuiInputBase-input": { p: 0, textAlign: "right" },
            "& .MuiInputBase-input::placeholder": { color: accent.main, opacity: 0.45 },
          }}
        />
      </Box>

      <TimelineNode status={status} accent={accent} isLast={isLast} animate={index === 0} />

      <Box
        sx={{
          flex: 1,
          mb: isLast ? 0 : 2.5,
          p: 2,
          borderRadius: 2,
          bgcolor: "#fff",
          border: "1px solid",
          borderColor: accent.light,
          boxShadow: `0 1px 3px rgba(0,0,0,0.04), 0 4px 16px ${accent.glow}`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            bgcolor: accent.main,
            borderRadius: "2px 0 0 2px",
          },
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 8px 24px ${accent.glow}`,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <InputBase
              value={item.title}
              onChange={(e) => onChange(item.id, { title: e.target.value })}
              placeholder="Event title"
              fullWidth
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1a1a2e",
                mb: item.description !== undefined ? 0.5 : 0,
                "& .MuiInputBase-input": { p: 0 },
                "& .MuiInputBase-input::placeholder": { color: "#9e9e9e", opacity: 1 },
              }}
            />
            <InputBase
              value={item.description ?? ""}
              onChange={(e) => onChange(item.id, { description: e.target.value })}
              placeholder="Add a description…"
              fullWidth
              multiline
              sx={{
                fontSize: 14,
                lineHeight: 1.55,
                color: "#5c5c7a",
                "& .MuiInputBase-input": { p: 0 },
                "& .MuiInputBase-input::placeholder": { color: "#bdbdbd", opacity: 1, fontStyle: "italic" },
              }}
            />
          </Box>

          <Box
            className="timeline-actions"
            sx={{
              display: "flex",
              flexDirection: "column",
              opacity: 0,
              transition: "opacity 0.15s",
              flexShrink: 0,
            }}
          >
            <Tooltip title="Move up">
              <span>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => onMove(item.id, -1)}
                  aria-label="Move up"
                  sx={{ color: "#9e9e9e" }}
                >
                  <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Move down">
              <span>
                <IconButton
                  size="small"
                  disabled={index === total - 1}
                  onClick={() => onMove(item.id, 1)}
                  aria-label="Move down"
                  sx={{ color: "#9e9e9e" }}
                >
                  <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Select
              size="small"
              value={status}
              onChange={(e) => onChange(item.id, { status: e.target.value as TimelineItemStatus })}
              variant="standard"
              disableUnderline
              sx={{
                fontSize: 11,
                color: accent.main,
                minWidth: 72,
                "& .MuiSelect-select": { py: 0.25, px: 0.5 },
              }}
            >
              {(Object.keys(TIMELINE_STATUS_LABELS) as TimelineItemStatus[]).map((key) => (
                <MenuItem key={key} value={key} sx={{ fontSize: 13 }}>
                  {TIMELINE_STATUS_LABELS[key]}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(item.id)}
                aria-label="Delete event"
                sx={{ color: "#bdbdbd", "&:hover": { color: "#c62828" } }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function TimelineCanvas({
  data: rawData,
  onChange,
}: {
  data: TimelineBlockData;
  onChange: (data: TimelineBlockData) => void;
}) {
  const data = normalizeTimelineData(rawData);

  const persistItems = useCallback(
    (items: TimelineItem[]) => {
      onChange({ ...data, items });
    },
    [data, onChange]
  );

  const handleItemChange = useCallback(
    (id: string, patch: Partial<Omit<TimelineItem, "id">>) => {
      persistItems(updateTimelineItem(data.items, id, patch));
    },
    [data.items, persistItems]
  );

  const handleDelete = useCallback(
    (id: string) => {
      persistItems(deleteTimelineItem(data.items, id));
    },
    [data.items, persistItems]
  );

  const handleMove = useCallback(
    (id: string, direction: -1 | 1) => {
      persistItems(moveTimelineItem(data.items, id, direction));
    },
    [data.items, persistItems]
  );

  const handleAdd = useCallback(() => {
    persistItems([...data.items, createTimelineItem()]);
  }, [data.items, persistItems]);

  return (
    <Box
      sx={{
        py: 2,
        px: { xs: 1, sm: 2 },
        position: "relative",
      }}
    >
      {data.showTitle && (
        <Typography
          className={caveat.className}
          sx={{
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "#1a1a2e",
            mb: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #1565c0 0%, #6a1b9a 50%, #00897b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {data.title || "Timeline"}
        </Typography>
      )}

      {data.items.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            px: 2,
            borderRadius: 2,
            border: "2px dashed",
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            No events yet. Add your first milestone or moment.
          </Typography>
          <Typography
            component="button"
            type="button"
            onClick={handleAdd}
            sx={{
              border: "none",
              bgcolor: "transparent",
              cursor: "pointer",
              color: "primary.main",
              fontWeight: 600,
              fontSize: 14,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            + Add first event
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxWidth: 640, mx: "auto" }}>
          {data.items.map((item, index) => (
            <TimelineItemRow
              key={item.id}
              item={item}
              index={index}
              total={data.items.length}
              onChange={handleItemChange}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1, pl: 9 }}>
            <Typography
              component="button"
              type="button"
              onClick={handleAdd}
              sx={{
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                color: "text.secondary",
                fontSize: 14,
                fontWeight: 500,
                p: 1,
                borderRadius: 1,
                transition: "color 0.15s, background 0.15s",
                "&:hover": { color: "primary.main", bgcolor: "action.hover" },
              }}
            >
              + Add event
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface TimelineBlockEditorProps {
  data: TimelineBlockData;
  onChange: (data: TimelineBlockData) => void;
}

export function TimelineBlockEditor({ data, onChange }: TimelineBlockEditorProps) {
  const normalized = normalizeTimelineData(data);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={normalized.showTitle !== false}
            onChange={(e) => onChange({ ...data, showTitle: e.target.checked })}
          />
        }
        label="Show title"
      />
      {normalized.showTitle !== false && (
        <TextField
          label="Title"
          value={data.title ?? ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          size="small"
          fullWidth
          placeholder="Timeline"
        />
      )}
      <Typography variant="caption" color="text.secondary">
        Add and edit events in the live preview. Use status to mark milestones or highlights.
      </Typography>
    </Box>
  );
}

interface TimelineBlockPreviewProps {
  block: BlockRow;
  data: TimelineBlockData;
}

export function TimelineBlockPreview({ block, data }: TimelineBlockPreviewProps) {
  const { updateBlock } = useDocumentEditor();
  return (
    <TimelineCanvas data={data} onChange={(next) => updateBlock(block.id, next)} />
  );
}
