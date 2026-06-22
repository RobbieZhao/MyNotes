import { BLOCK_TYPE_LABELS } from "@/types/blocks";
import type { BlockRow } from "@/types/database";

const KNOWN_BLOCK_TYPES = new Set<string>(Object.keys(BLOCK_TYPE_LABELS));

/** Drop legacy block rows that are no longer supported in the editor. */
export function prepareBlocksForEditor(blocks: BlockRow[]): BlockRow[] {
  return blocks.filter((block) => KNOWN_BLOCK_TYPES.has(block.type));
}
