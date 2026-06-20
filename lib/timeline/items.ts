import type { TimelineBlockData, TimelineItem, TimelineItemStatus } from "@/types/blocks";

export function createTimelineItem(
  partial: Partial<Omit<TimelineItem, "id">> = {}
): TimelineItem {
  return {
    id: crypto.randomUUID(),
    date: partial.date ?? "",
    title: partial.title ?? "",
    description: partial.description ?? "",
    status: partial.status ?? "default",
  };
}

export function normalizeTimelineItem(item: Partial<TimelineItem> & { id: string }): TimelineItem {
  return {
    id: item.id,
    date: item.date ?? "",
    title: item.title ?? "",
    description: item.description ?? "",
    status: item.status ?? "default",
  };
}

export function normalizeTimelineData(data: TimelineBlockData): TimelineBlockData {
  return {
    title: data.title ?? "Timeline",
    showTitle: data.showTitle !== false,
    items: (data.items ?? []).map(normalizeTimelineItem),
  };
}

export function updateTimelineItem(
  items: TimelineItem[],
  id: string,
  patch: Partial<Omit<TimelineItem, "id">>
): TimelineItem[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function deleteTimelineItem(items: TimelineItem[], id: string): TimelineItem[] {
  return items.filter((item) => item.id !== id);
}

export function moveTimelineItem(items: TimelineItem[], id: string, direction: -1 | 1): TimelineItem[] {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return items;

  const target = index + direction;
  if (target < 0 || target >= items.length) return items;

  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const TIMELINE_STATUS_LABELS: Record<TimelineItemStatus, string> = {
  default: "Default",
  milestone: "Milestone",
  highlight: "Highlight",
};

export const TIMELINE_ACCENT_COLORS = [
  { main: "#1565c0", light: "#e3f2fd", glow: "rgba(21, 101, 192, 0.35)" },
  { main: "#6a1b9a", light: "#f3e5f5", glow: "rgba(106, 27, 154, 0.35)" },
  { main: "#00897b", light: "#e0f2f1", glow: "rgba(0, 137, 123, 0.35)" },
  { main: "#ef6c00", light: "#fff3e0", glow: "rgba(239, 108, 0, 0.35)" },
  { main: "#c62828", light: "#ffebee", glow: "rgba(198, 40, 40, 0.35)" },
];

export function accentForItem(index: number, status: TimelineItemStatus = "default") {
  if (status === "milestone") {
    return { main: "#b8860b", light: "#fff8e1", glow: "rgba(184, 134, 11, 0.45)" };
  }
  if (status === "highlight") {
    return { main: "#1565c0", light: "#e8eaf6", glow: "rgba(21, 101, 192, 0.5)" };
  }
  return TIMELINE_ACCENT_COLORS[index % TIMELINE_ACCENT_COLORS.length];
}
