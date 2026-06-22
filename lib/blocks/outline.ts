import type { BlockGroup, BlockRow } from "@/types/database";

export const GLOBAL_GROUP_KEY = "__global__";

export function resolveGroupKey(groupId: string | null | undefined): string {
  return groupId ?? GLOBAL_GROUP_KEY;
}

function sameId(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export type OutlineNode =
  | { kind: "block"; block: BlockRow; position: number }
  | { kind: "group"; group: BlockGroup; blocks: BlockRow[]; position: number };

function resolveGroupsForOutline(groups: BlockGroup[], blocks: BlockRow[]): BlockGroup[] {
  const byId = new Map(groups.map((group) => [group.id, group]));

  for (const block of blocks) {
    if (!block.group_id || byId.has(block.group_id)) continue;

    const members = blocks.filter((member) => sameId(member.group_id, block.group_id));
    byId.set(block.group_id, {
      id: block.group_id,
      document_id: block.document_id,
      name: "Untitled Group",
      position: Math.min(...members.map((member) => member.position)),
      created_at: "",
      updated_at: "",
    });
  }

  return [...byId.values()].sort((a, b) => a.position - b.position);
}

export function buildDocumentOutline(
  groups: BlockGroup[],
  blocks: BlockRow[]
): OutlineNode[] {
  const allGroups = resolveGroupsForOutline(groups, blocks);

  const groupNodes: OutlineNode[] = allGroups.map((group) => ({
    kind: "group" as const,
    group,
    blocks: blocks
      .filter((block) => sameId(block.group_id, group.id))
      .sort((a, b) => a.position - b.position),
    position: group.position,
  }));

  const blockNodes: OutlineNode[] = blocks
    .filter((block) => !block.group_id)
    .sort((a, b) => a.position - b.position)
    .map((block) => ({
      kind: "block" as const,
      block,
      position: block.position,
    }));

  return [...groupNodes, ...blockNodes].sort((a, b) => a.position - b.position);
}

export function flattenOutline(outline: OutlineNode[]): BlockRow[] {
  const result: BlockRow[] = [];
  for (const node of outline) {
    if (node.kind === "block") {
      result.push(node.block);
    } else {
      result.push(...node.blocks);
    }
  }
  return result;
}

export function groupHasBlockType(
  blocks: BlockRow[],
  groupId: string,
  type: BlockRow["type"]
): boolean {
  return blocks.some((block) => sameId(block.group_id, groupId) && block.type === type);
}

export function getGroupById(groups: BlockGroup[], groupId: string): BlockGroup | undefined {
  return groups.find((group) => group.id === groupId);
}

export function buildDisplayOutline(outline: OutlineNode[]): OutlineNode[] {
  return outline;
}

export function findGroupIdForBlock(outline: OutlineNode[], blockId: string): string | null {
  for (const node of outline) {
    if (node.kind === "group" && node.blocks.some((block) => block.id === blockId)) {
      return node.group.id;
    }
  }
  return null;
}
