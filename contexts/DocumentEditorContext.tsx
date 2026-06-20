"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { buildDocumentOutline, buildDisplayOutline, flattenOutline } from "@/lib/blocks/outline";
import {
  applyGroupBlockReorder,
  applyOutlineReorder,
  mergeBlockUpdates,
  mergeGroupUpdates,
} from "@/lib/blocks/reorder";
import { positionForInsertAtEnd } from "@/lib/blocks/position";
import { useOptionalActiveDocument } from "@/contexts/ActiveDocumentContext";
import type { BlockData, BlockType } from "@/types/blocks";
import { DEFAULT_BLOCK_DATA } from "@/types/blocks";
import type { BlockGroup, BlockRow, Dataset, Document } from "@/types/database";
import type { DatasetConfig } from "@/types/dataset";
import { useDatasets } from "@/contexts/DatasetsContext";

interface DocumentEditorContextValue {
  document: Document;
  blocks: BlockRow[];
  blockGroups: BlockGroup[];
  outline: ReturnType<typeof buildDocumentOutline>;
  displayOutline: ReturnType<typeof buildDisplayOutline>;
  orderedBlocks: BlockRow[];
  datasets: Dataset[];
  selectedBlockId: string | null;
  previewScrollKey: string | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  setSelectedBlockId: (id: string | null) => void;
  scrollPreviewTo: (key: string) => void;
  commitDocumentTitle: (title: string) => Promise<void>;
  addBlock: (type: BlockType, groupId?: string | null) => Promise<void>;
  addGroup: (name?: string) => Promise<BlockGroup | null>;
  updateGroupName: (id: string, name: string) => void;
  deleteGroup: (id: string) => Promise<void>;
  updateBlock: (id: string, data: BlockData) => void;
  deleteBlock: (id: string) => Promise<void>;
  reorderOutline: (fromIndex: number, toIndex: number) => Promise<void>;
  reorderBlocksInGroup: (groupId: string, fromIndex: number, toIndex: number) => Promise<void>;
  refreshDatasets: () => Promise<void>;
  createDataset: (
    name: string,
    data: Dataset["data"],
    config: DatasetConfig
  ) => Promise<Dataset | null>;
  updateDatasetConfig: (id: string, config: DatasetConfig) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
}

const DocumentEditorContext = createContext<DocumentEditorContextValue | null>(null);

interface DocumentEditorProviderProps {
  document: Document;
  initialBlocks: BlockRow[];
  initialBlockGroups: BlockGroup[];
  children: ReactNode;
}

export function DocumentEditorProvider({
  document: initialDocument,
  initialBlocks,
  initialBlockGroups,
  children,
}: DocumentEditorProviderProps) {
  const supabase = useMemo(() => createClient(), []);
  const activeDocumentCtx = useOptionalActiveDocument();
  const { datasets, refreshDatasets, createDataset, updateDatasetConfig, deleteDataset } =
    useDatasets();
  const [document, setDocument] = useState(initialDocument);
  const [blocks, setBlocks] = useState(
    initialBlocks.map((block) => ({ ...block, group_id: block.group_id ?? null }))
  );
  const [blockGroups, setBlockGroups] = useState<BlockGroup[]>(initialBlockGroups);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(() => {
    const firstVisible = initialBlocks.find((block) => block.type !== "dataset");
    return firstVisible?.id ?? null;
  });
  const [previewScrollKey, setPreviewScrollKey] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pendingBlockUpdates, setPendingBlockUpdates] = useState<Map<string, BlockData>>(
    new Map()
  );
  const [pendingGroupNames, setPendingGroupNames] = useState<Map<string, string>>(new Map());

  const sortedGroups = useMemo(
    () => [...blockGroups].sort((a, b) => a.position - b.position),
    [blockGroups]
  );
  const outline = useMemo(
    () => buildDocumentOutline(sortedGroups, blocks),
    [sortedGroups, blocks]
  );
  const displayOutline = useMemo(() => buildDisplayOutline(outline), [outline]);
  const orderedBlocks = useMemo(() => flattenOutline(outline), [outline]);

  useEffect(() => {
    if (!selectedBlockId) return;
    const block = blocks.find((item) => item.id === selectedBlockId);
    if (block?.type !== "dataset") return;
    const fallback = displayOutline.flatMap((node) =>
      node.kind === "block" ? [node.block] : node.blocks
    )[0];
    setSelectedBlockId(fallback?.id ?? null);
  }, [blocks, displayOutline, selectedBlockId]);

  useEffect(() => {
    void (async () => {
      const [groupsResult, blocksResult] = await Promise.all([
        supabase
          .from("block_groups")
          .select("*")
          .eq("document_id", document.id)
          .order("position"),
        supabase.from("blocks").select("*").eq("document_id", document.id).order("position"),
      ]);

      if (!groupsResult.error && groupsResult.data) {
        setBlockGroups(groupsResult.data as BlockGroup[]);
      }
      if (!blocksResult.error && blocksResult.data) {
        setBlocks(
          (blocksResult.data as BlockRow[]).map((block) => ({
            ...block,
            group_id: block.group_id ?? null,
          }))
        );
      }
    })();
  }, [document.id, supabase]);

  const updateDocumentTitle = useCallback(
    async (title: string) => {
      const trimmed = title.trim() || "Untitled Document";
      setDocument((prev) => ({ ...prev, title: trimmed }));
      setSaveStatus("saving");
      const { error } = await supabase
        .from("documents")
        .update({ title: trimmed })
        .eq("id", document.id);
      setSaveStatus(error ? "error" : "saved");
    },
    [document.id, supabase]
  );

  const scrollPreviewTo = useCallback((key: string) => {
    setPreviewScrollKey(key);
  }, []);

  useEffect(() => {
    activeDocumentCtx?.setActiveDocument(document);
    return () => activeDocumentCtx?.setActiveDocument(null);
  }, [document.id, document.title, activeDocumentCtx]);

  useEffect(() => {
    activeDocumentCtx?.registerTitleCommit(updateDocumentTitle);
  }, [activeDocumentCtx, updateDocumentTitle]);

  const persistBlockData = useCallback(
    async (id: string, data: BlockData) => {
      setSaveStatus("saving");
      const { error } = await supabase.from("blocks").update({ data }).eq("id", id);
      setSaveStatus(error ? "error" : "saved");
    },
    [supabase]
  );

  const updateBlock = useCallback((id: string, data: BlockData) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, data } : block))
    );
    setPendingBlockUpdates((prev) => new Map(prev).set(id, data));
  }, []);

  useEffect(() => {
    if (pendingBlockUpdates.size === 0) return;
    const timer = setTimeout(async () => {
      const updates = new Map(pendingBlockUpdates);
      setPendingBlockUpdates(new Map());
      for (const [id, data] of updates) await persistBlockData(id, data);
    }, 500);
    return () => clearTimeout(timer);
  }, [pendingBlockUpdates, persistBlockData]);

  useEffect(() => {
    if (pendingGroupNames.size === 0) return;
    const timer = setTimeout(async () => {
      const updates = new Map(pendingGroupNames);
      setPendingGroupNames(new Map());
      for (const [id, name] of updates) {
        setSaveStatus("saving");
        const { error } = await supabase.from("block_groups").update({ name }).eq("id", id);
        setSaveStatus(error ? "error" : "saved");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [pendingGroupNames, supabase]);

  const addGroup = useCallback(
    async (name = "Untitled Group") => {
      const positions = outline.map((node) => node.position);
      const position = positionForInsertAtEnd(
        positions.length > 0 ? positions[positions.length - 1] : null
      );
      const { data, error } = await supabase
        .from("block_groups")
        .insert({ document_id: document.id, name, position })
        .select("*")
        .single();
      if (!error && data) {
        const group = data as BlockGroup;
        setBlockGroups((prev) => [...prev, group]);
        return group;
      }
      return null;
    },
    [document.id, outline, supabase]
  );

  const updateGroupName = useCallback((id: string, name: string) => {
    setBlockGroups((prev) =>
      prev.map((group) => (group.id === id ? { ...group, name } : group))
    );
    setPendingGroupNames((prev) => new Map(prev).set(id, name));
  }, []);

  const deleteGroup = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("block_groups").delete().eq("id", id);
      if (!error) {
        setBlockGroups((prev) => prev.filter((group) => group.id !== id));
        setBlocks((prev) =>
          prev.map((block) =>
            block.group_id === id ? { ...block, group_id: null } : block
          )
        );
      }
    },
    [supabase]
  );

  const addBlock = useCallback(
    async (type: BlockType, groupId: string | null = null) => {
      const siblings = groupId
        ? blocks.filter((block) => block.group_id === groupId)
        : blocks.filter((block) => !block.group_id);
      const positions = siblings.map((block) => block.position);
      const position = positionForInsertAtEnd(
        positions.length > 0 ? positions[positions.length - 1] : null
      );
      const { data, error } = await supabase
        .from("blocks")
        .insert({
          document_id: document.id,
          position,
          type,
          data: DEFAULT_BLOCK_DATA[type],
          group_id: groupId,
        })
        .select("*")
        .single();
      if (!error && data) {
        const block = { ...(data as BlockRow), group_id: (data as BlockRow).group_id ?? null };
        setBlocks((prev) => [...prev, block]);
        setSelectedBlockId(block.id);
      }
    },
    [blocks, document.id, supabase]
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("blocks").delete().eq("id", id);
      if (!error) {
        setBlocks((prev) => prev.filter((block) => block.id !== id));
        setSelectedBlockId((current) => (current === id ? null : current));
      }
    },
    [supabase]
  );

  const reorderOutline = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const { groupUpdates, blockUpdates } = applyOutlineReorder(outline, fromIndex, toIndex);

      setBlockGroups((prev) => mergeGroupUpdates(prev, groupUpdates));
      setBlocks((prev) => mergeBlockUpdates(prev, blockUpdates));

      setSaveStatus("saving");
      await Promise.all([
        ...groupUpdates.map(({ id, position }) =>
          supabase.from("block_groups").update({ position }).eq("id", id)
        ),
        ...blockUpdates.map(({ id, position }) =>
          supabase.from("blocks").update({ position }).eq("id", id)
        ),
      ]);
      setSaveStatus("saved");
    },
    [outline, supabase]
  );

  const reorderBlocksInGroup = useCallback(
    async (groupId: string, fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const updates = applyGroupBlockReorder(blocks, groupId, fromIndex, toIndex);
      setBlocks((prev) => mergeBlockUpdates(prev, updates));
      setSaveStatus("saving");
      await Promise.all(
        updates.map(({ id, position }) =>
          supabase.from("blocks").update({ position }).eq("id", id)
        )
      );
      setSaveStatus("saved");
    },
    [blocks, supabase]
  );

  const value = useMemo(
    () => ({
      document,
      blocks,
      blockGroups: sortedGroups,
      outline,
      displayOutline,
      orderedBlocks,
      datasets,
      selectedBlockId,
      previewScrollKey,
      saveStatus,
      setSelectedBlockId,
      scrollPreviewTo,
      commitDocumentTitle: updateDocumentTitle,
      addBlock,
      addGroup,
      updateGroupName,
      deleteGroup,
      updateBlock,
      deleteBlock,
      reorderOutline,
      reorderBlocksInGroup,
      refreshDatasets,
      createDataset,
      updateDatasetConfig,
      deleteDataset,
    }),
    [
      document,
      blocks,
      sortedGroups,
      outline,
      displayOutline,
      orderedBlocks,
      datasets,
      selectedBlockId,
      previewScrollKey,
      saveStatus,
      updateDocumentTitle,
      scrollPreviewTo,
      addBlock,
      addGroup,
      updateGroupName,
      deleteGroup,
      updateBlock,
      deleteBlock,
      reorderOutline,
      reorderBlocksInGroup,
      refreshDatasets,
      createDataset,
      updateDatasetConfig,
      deleteDataset,
    ]
  );

  return (
    <DocumentEditorContext.Provider value={value}>
      {children}
    </DocumentEditorContext.Provider>
  );
}

export function useDocumentEditor() {
  const ctx = useContext(DocumentEditorContext);
  if (!ctx) throw new Error("useDocumentEditor must be used within DocumentEditorProvider");
  return ctx;
}
