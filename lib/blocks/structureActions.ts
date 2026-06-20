import {
  needsReindex,
  positionForMoveDown,
  positionForMoveUp,
  reindexPositions,
} from "@/lib/blocks/position";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function moveOrderedItems<T extends { id: string; position: number }>(
  supabase: SupabaseClient,
  table: "blocks" | "block_groups",
  items: T[],
  id: string,
  direction: "up" | "down",
  onLocalUpdate: (updates: { id: string; position: number }[]) => void
): Promise<void> {
  const ordered = [...items].sort((a, b) => a.position - b.position);
  const index = ordered.findIndex((item) => item.id === id);
  if (index === -1) return;
  if (direction === "up" && index === 0) return;
  if (direction === "down" && index === ordered.length - 1) return;

  const positions = ordered.map((item) => item.position);
  const newPosition =
    direction === "up"
      ? positionForMoveUp(index, positions)
      : positionForMoveDown(index, positions);

  if (newPosition === "reindex") {
    const reordered =
      direction === "up"
        ? [
            ...ordered.slice(0, index - 1),
            ordered[index],
            ordered[index - 1],
            ...ordered.slice(index + 1),
          ]
        : [
            ...ordered.slice(0, index),
            ordered[index + 1],
            ordered[index],
            ...ordered.slice(index + 2),
          ];
    const updates = reindexPositions(reordered);
    onLocalUpdate(updates);
    await Promise.all(
      updates.map(({ id: itemId, position }) =>
        supabase.from(table).update({ position }).eq("id", itemId)
      )
    );
    return;
  }

  onLocalUpdate([{ id, position: newPosition as number }]);
  await supabase.from(table).update({ position: newPosition }).eq("id", id);

  const updatedPositions = ordered.map((item) =>
    item.id === id ? (newPosition as number) : item.position
  );
  if (needsReindex(updatedPositions)) {
    const reordered =
      direction === "up"
        ? [
            ...ordered.slice(0, index - 1),
            ordered[index],
            ordered[index - 1],
            ...ordered.slice(index + 1),
          ]
        : [
            ...ordered.slice(0, index),
            ordered[index + 1],
            ordered[index],
            ...ordered.slice(index + 2),
          ];
    const updates = reindexPositions(reordered);
    onLocalUpdate(updates);
    await Promise.all(
      updates.map(({ id: itemId, position }) =>
        supabase.from(table).update({ position }).eq("id", itemId)
      )
    );
  }
}
