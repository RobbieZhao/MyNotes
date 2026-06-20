"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { AddBlockMenu } from "@/components/editor/AddBlockMenu";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";
import type { DragPayload } from "@/lib/blocks/reorder";
import { parseDragPayload } from "@/lib/blocks/reorder";
import { findGroupIdForBlock } from "@/lib/blocks/outline";
import { BLOCK_TYPE_LABELS } from "@/types/blocks";
import type { BlockRow } from "@/types/database";

const DRAG_MIME = "application/x-mynotes-dnd";

function collapsedStorageKey(documentId: string) {
  return `mynotes-structure-collapsed-${documentId}`;
}

function loadCollapsedGroups(documentId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(collapsedStorageKey(documentId));
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // ignore invalid storage
  }
  return new Set();
}

function saveCollapsedGroups(documentId: string, collapsed: Set<string>) {
  try {
    localStorage.setItem(
      collapsedStorageKey(documentId),
      JSON.stringify([...collapsed])
    );
  } catch {
    // ignore quota errors
  }
}

function DropZone({
  active,
  onDrop,
}: {
  active: boolean;
  onDrop: () => void;
}) {
  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop();
      }}
      sx={{
        height: active ? 8 : 4,
        mx: 1,
        my: 0.25,
        borderRadius: 1,
        bgcolor: active ? "primary.main" : "transparent",
        transition: "height 0.1s ease, background-color 0.1s ease",
      }}
    />
  );
}

function startDrag(e: React.DragEvent, payload: DragPayload) {
  e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
  e.dataTransfer.effectAllowed = "move";
}

function readDrag(e: React.DragEvent): DragPayload | null {
  const raw = e.dataTransfer.getData(DRAG_MIME);
  return raw ? parseDragPayload(raw) : null;
}

function BlockRowItem({
  block,
  selected,
  onSelect,
  onDelete,
  nested = false,
  draggable = true,
  dragPayload,
}: {
  block: BlockRow;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  nested?: boolean;
  draggable?: boolean;
  dragPayload: DragPayload;
}) {
  return (
    <ListItemButton
      selected={selected}
      onClick={onSelect}
      draggable={draggable}
      onDragStart={(e) => startDrag(e, dragPayload)}
      sx={{
        pl: nested ? 4 : 1,
        py: 0.5,
        borderRadius: 1,
        "&.Mui-selected": { bgcolor: "action.selected" },
        "&:hover .structure-actions": { opacity: 1 },
      }}
    >
      <DragIndicatorIcon
        sx={{ fontSize: 16, color: "text.disabled", mr: 0.5, cursor: "grab" }}
      />
      <ListItemIcon sx={{ minWidth: 28 }}>
        <InsertDriveFileOutlinedIcon fontSize="small" color="action" />
      </ListItemIcon>
      <ListItemText
        primary={BLOCK_TYPE_LABELS[block.type]}
        slotProps={{ primary: { variant: "body2", noWrap: true } }}
      />
      <Box className="structure-actions" sx={{ display: "flex", opacity: 0 }}>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <DeleteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </ListItemButton>
  );
}

function GroupRowItem({
  name,
  collapsed,
  onToggleCollapse,
  onRename,
  onDelete,
  dragPayload,
}: {
  name: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  dragPayload: DragPayload;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <Box
      draggable
      onDragStart={(e) => startDrag(e, dragPayload)}
      sx={{
        display: "flex",
        alignItems: "center",
        py: 0.5,
        pl: 1,
        pr: 0.5,
        borderRadius: 1,
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        "&:hover .structure-actions": { opacity: 1 },
      }}
      onClick={onToggleCollapse}
      role="button"
      aria-expanded={!collapsed}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleCollapse();
        }
      }}
    >
      <DragIndicatorIcon
        sx={{ fontSize: 16, color: "text.disabled", mr: 0.5, cursor: "grab" }}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          mr: 0.25,
          color: "text.secondary",
        }}
        aria-hidden
      >
        {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
      </Box>
      <FolderOutlinedIcon fontSize="small" color="primary" sx={{ mr: 1, flexShrink: 0 }} />
      {editing ? (
        <InputBase
          autoFocus
          defaultValue={name}
          onBlur={(e) => {
            onRename(e.target.value.trim() || "Untitled Group");
            setEditing(false);
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              onRename((e.target as HTMLInputElement).value.trim() || "Untitled Group");
              setEditing(false);
            }
            if (e.key === "Escape") setEditing(false);
          }}
          sx={{ flex: 1, fontSize: 14, fontWeight: 600 }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <Typography
          variant="body2"
          noWrap
          sx={{ flex: 1, fontWeight: 600 }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          {name}
        </Typography>
      )}
      <Box className="structure-actions" sx={{ display: "flex", opacity: 0, flexShrink: 0 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Delete group"
        >
          <DeleteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export function DocumentStructureSidebar() {
  const {
    document,
    outline,
    displayOutline,
    selectedBlockId,
    setSelectedBlockId,
    scrollPreviewTo,
    addGroup,
    updateGroupName,
    deleteGroup,
    deleteBlock,
    reorderOutline,
    reorderBlocksInGroup,
  } = useDocumentEditor();

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  const skipNextSaveRef = useRef(true);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverGroupBlock, setDragOverGroupBlock] = useState<{
    groupId: string;
    index: number;
  } | null>(null);

  useEffect(() => {
    skipNextSaveRef.current = true;
    setCollapsedGroups(loadCollapsedGroups(document.id));
  }, [document.id]);

  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    saveCollapsedGroups(document.id, collapsedGroups);
  }, [document.id, collapsedGroups]);

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandGroup = (id: string) => {
    setCollapsedGroups((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleAddGroup = async () => {
    const group = await addGroup();
    if (group) expandGroup(group.id);
  };

  const navigateToBlock = (blockId: string) => {
    const groupId = findGroupIdForBlock(displayOutline, blockId);
    if (groupId) expandGroup(groupId);
    setSelectedBlockId(blockId);
    scrollPreviewTo(`block-${blockId}`);
  };

  const handleOutlineDrop = (toDisplayIndex: number) => {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const payload = readDrag(e);
      if (!payload || payload.scope !== "outline") return;

      const fromIndex = outline.findIndex((node) =>
        node.kind === "group"
          ? payload.kind === "group" && node.group.id === payload.id
          : payload.kind === "block" && node.block.id === payload.id
      );
      if (fromIndex === -1) return;

      const targetNode = displayOutline[toDisplayIndex];
      let toIndex = outline.length;
      if (targetNode) {
        toIndex = outline.findIndex((node) =>
          node.kind === "group"
            ? targetNode.kind === "group" && node.group.id === targetNode.group.id
            : targetNode.kind === "block" && node.block.id === targetNode.block.id
        );
        if (toIndex === -1) toIndex = outline.length;
      }

      const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
      void reorderOutline(fromIndex, adjustedTo);
      setDragOverIndex(null);
    };
  };

  const handleGroupBlockDrop = (groupId: string, toIndex: number) => {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const payload = readDrag(e);
      if (!payload || payload.scope !== "group" || payload.groupId !== groupId) return;

      const node = outline.find((n) => n.kind === "group" && n.group.id === groupId);
      if (!node || node.kind !== "group") return;

      const fromIndex = node.blocks.findIndex((b) => b.id === payload.blockId);
      if (fromIndex === -1) return;
      const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
      void reorderBlocksInGroup(groupId, fromIndex, adjustedTo);
      setDragOverGroupBlock(null);
    };
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "grey.50",
        pt: 5,
      }}
    >
      <Box
        sx={{
          p: 1.5,
          pt: 0,
          pr: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Structure
        </Typography>
        <Tooltip title="New group">
          <IconButton size="small" onClick={() => void handleAddGroup()}>
            <CreateNewFolderOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <List dense sx={{ flex: 1, overflow: "auto", px: 0.5 }}>
        {displayOutline.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: "block" }}>
            Create a group or add a block to get started.
          </Typography>
        ) : (
          <>
            <DropZone
              active={dragOverIndex === 0}
              onDrop={() => {}}
            />
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(0);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={handleOutlineDrop(0)}
            />
            {displayOutline.map((node, index) => (
              <Box key={node.kind === "group" ? node.group.id : node.block.id}>
                {node.kind === "block" ? (
                  <BlockRowItem
                    block={node.block}
                    selected={selectedBlockId === node.block.id}
                    onSelect={() => navigateToBlock(node.block.id)}
                    onDelete={() => void deleteBlock(node.block.id)}
                    dragPayload={{ scope: "outline", kind: "block", id: node.block.id }}
                  />
                ) : (
                  <>
                    <GroupRowItem
                      name={node.group.name}
                      collapsed={collapsedGroups.has(node.group.id)}
                      onToggleCollapse={() => toggleGroup(node.group.id)}
                      onRename={(name) => updateGroupName(node.group.id, name)}
                      onDelete={() => void deleteGroup(node.group.id)}
                      dragPayload={{ scope: "outline", kind: "group", id: node.group.id }}
                    />
                    {!collapsedGroups.has(node.group.id) && (
                      <List dense disablePadding>
                        {node.blocks.map((block, blockIndex) => (
                          <Box key={block.id}>
                            <Box
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverGroupBlock({ groupId: node.group.id, index: blockIndex });
                              }}
                              onDragLeave={() => setDragOverGroupBlock(null)}
                              onDrop={handleGroupBlockDrop(node.group.id, blockIndex)}
                            >
                              <DropZone
                                active={
                                  dragOverGroupBlock?.groupId === node.group.id &&
                                  dragOverGroupBlock.index === blockIndex
                                }
                                onDrop={() => {}}
                              />
                            </Box>
                            <BlockRowItem
                              block={block}
                              nested
                              selected={selectedBlockId === block.id}
                              onSelect={() => navigateToBlock(block.id)}
                              onDelete={() => void deleteBlock(block.id)}
                              dragPayload={{
                                scope: "group",
                                groupId: node.group.id,
                                blockId: block.id,
                              }}
                            />
                          </Box>
                        ))}
                        <Box
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverGroupBlock({
                              groupId: node.group.id,
                              index: node.blocks.length,
                            });
                          }}
                          onDrop={handleGroupBlockDrop(node.group.id, node.blocks.length)}
                        >
                          <DropZone
                            active={
                              dragOverGroupBlock?.groupId === node.group.id &&
                              dragOverGroupBlock.index === node.blocks.length
                            }
                            onDrop={() => {}}
                          />
                        </Box>
                        <Box sx={{ pl: 4, py: 0.5 }}>
                          <AddBlockMenu groupId={node.group.id} label="Add to group" compact />
                        </Box>
                      </List>
                    )}
                  </>
                )}
                <Box
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(index + 1);
                  }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={handleOutlineDrop(index + 1)}
                >
                  <DropZone active={dragOverIndex === index + 1} onDrop={() => {}} />
                </Box>
              </Box>
            ))}
          </>
        )}
      </List>

      <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
        <AddBlockMenu label="Add block" />
        <ButtonNewGroup onClick={() => void handleAddGroup()} />
      </Box>
    </Box>
  );
}

function ButtonNewGroup({ onClick }: { onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        mt: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        py: 0.75,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        cursor: "pointer",
        fontSize: 13,
        color: "text.secondary",
        "&:hover": { bgcolor: "action.hover", color: "text.primary" },
      }}
    >
      <AddIcon sx={{ fontSize: 16 }} />
      New group
    </Box>
  );
}
