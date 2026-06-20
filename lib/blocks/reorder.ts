import type { OutlineNode } from "@/lib/blocks/outline";
import { reindexPositions } from "@/lib/blocks/position";
import type { BlockGroup, BlockRow } from "@/types/database";

export type DragPayload =
  | { scope: "outline"; id: string; kind: "group" | "block" }
  | { scope: "group"; groupId: string; blockId: string };

export function parseDragPayload(raw: string): DragPayload | null {
  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

export function reorderArray<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function applyOutlineReorder(
  outline: OutlineNode[],
  fromIndex: number,
  toIndex: number
): {
  outline: OutlineNode[];
  groupUpdates: { id: string; position: number }[];
  blockUpdates: { id: string; position: number }[];
} {
  const reordered = reorderArray(outline, fromIndex, toIndex);
  const groupUpdates: { id: string; position: number }[] = [];
  const blockUpdates: { id: string; position: number }[] = [];

  reordered.forEach((node, index) => {
    const position = (index + 1) * 1000;
    if (node.kind === "group") {
      groupUpdates.push({ id: node.group.id, position });
    } else {
      blockUpdates.push({ id: node.block.id, position });
    }
  });

  return { outline: reordered, groupUpdates, blockUpdates };
}

export function applyGroupBlockReorder(
  blocks: BlockRow[],
  groupId: string,
  fromIndex: number,
  toIndex: number
): { id: string; position: number }[] {
  const siblings = blocks
    .filter((b) => b.group_id === groupId)
    .sort((a, b) => a.position - b.position);
  const reordered = reorderArray(siblings, fromIndex, toIndex);
  return reindexPositions(reordered);
}

export function mergeGroupUpdates(
  groups: BlockGroup[],
  updates: { id: string; position: number }[]
): BlockGroup[] {
  const map = new Map(updates.map((u) => [u.id, u.position]));
  return groups.map((g) =>
    map.has(g.id) ? { ...g, position: map.get(g.id)! } : g
  );
}

export function mergeBlockUpdates(
  blocks: BlockRow[],
  updates: { id: string; position: number }[]
): BlockRow[] {
  const map = new Map(updates.map((u) => [u.id, u.position]));
  return blocks.map((b) =>
    map.has(b.id) ? { ...b, position: map.get(b.id)! } : b
  );
}
