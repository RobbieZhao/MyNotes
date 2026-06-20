"use client";

import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import { Caveat } from "next/font/google";
import { useDocumentEditor } from "@/contexts/DocumentEditorContext";
import {
  createTodoItem,
  deleteItemFromTree,
  flattenTodoItems,
  insertTodoItem,
  normalizeTodoListData,
  updateItemInTree,
} from "@/lib/todo/tree";
import type { TodoItem, TodoListBlockData } from "@/types/blocks";
import type { BlockRow } from "@/types/database";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "600", "700"] });

const LINE_HEIGHT = 28;
const MARGIN_LEFT = 40;

interface DraftState {
  text: string;
  parentId: string | null;
}

function PaperCheckbox({
  checked,
  onToggle,
  disabled = false,
}: {
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <Box
      component={disabled ? "span" : "button"}
      type={disabled ? undefined : "button"}
      onClick={disabled ? undefined : onToggle}
      aria-checked={checked}
      role="checkbox"
      sx={{
        width: 18,
        height: 18,
        minWidth: 18,
        mt: "5px",
        p: 0,
        border: "2px solid",
        borderColor: checked ? "#5c4a3a" : "#b8956a",
        borderRadius: "3px",
        bgcolor: checked ? "#5c4a3a" : "transparent",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.2s ease",
        ...(!disabled && {
          "&:hover": {
            borderColor: "#5c4a3a",
            bgcolor: checked ? "#4a3a2e" : "rgba(92, 74, 58, 0.06)",
          },
        }),
      }}
    >
      {checked && (
        <Box component="span" sx={{ color: "#fdf6e3", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>
          ✓
        </Box>
      )}
    </Box>
  );
}

function TodoItemRow({
  item,
  depth,
  onToggle,
  onTextChange,
  onDelete,
  onEnter,
  inputRef,
}: {
  item: TodoItem;
  depth: number;
  onToggle: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onEnter: (id: string) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          minHeight: LINE_HEIGHT,
          pl: depth * 2.5,
          "&:hover .todo-actions": { opacity: 1 },
        }}
      >
        <PaperCheckbox checked={item.done} onToggle={() => onToggle(item.id)} />
        <InputBase
          inputRef={inputRef}
          value={item.text}
          onChange={(e) => onTextChange(item.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onEnter(item.id);
            }
          }}
          placeholder={depth === 0 ? "Write a task…" : "Sub-task…"}
          sx={todoInputSx(item.done, depth)}
        />
        <Box className="todo-actions" sx={{ display: "flex", opacity: 0, transition: "opacity 0.15s", mt: 0.25 }}>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => onDelete(item.id)}
              aria-label="Delete item"
              sx={{ color: "#a08060", "&:hover": { color: "#c62828" } }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {item.children.map((child) => (
        <TodoItemRow
          key={child.id}
          item={child}
          depth={depth + 1}
          onToggle={onToggle}
          onTextChange={onTextChange}
          onDelete={onDelete}
          onEnter={onEnter}
        />
      ))}
    </Box>
  );
}

function todoInputSx(done: boolean, depth: number) {
  return {
    flex: 1,
    fontSize: depth === 0 ? 15 : 14,
    lineHeight: `${LINE_HEIGHT}px`,
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: done ? "#9a8b7a" : "#3d3429",
    textDecoration: done ? "line-through" : "none",
    textDecorationColor: "#b8956a",
    opacity: done ? 0.65 : 1,
    "& .MuiInputBase-input": { p: 0, minHeight: LINE_HEIGHT },
    "& .MuiInputBase-input::placeholder": { color: "#c4b5a0", opacity: 1, fontStyle: "italic" },
  };
}

function DraftRow({
  draft,
  depth,
  onChange,
  onKeyDown,
  inputRef,
}: {
  draft: DraftState;
  depth: number;
  onChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, minHeight: LINE_HEIGHT, pl: depth * 2.5 }}>
      <PaperCheckbox checked={false} disabled />
      <InputBase
        inputRef={inputRef}
        value={draft.text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={depth === 0 ? "New task… (Enter to add, Tab for sub-item)" : "New sub-task…"}
        autoFocus
        sx={{
          ...todoInputSx(false, depth),
          "& .MuiInputBase-input": {
            ...todoInputSx(false, depth)["& .MuiInputBase-input"],
            fontStyle: "italic",
          },
        }}
      />
    </Box>
  );
}

interface TodoListPaperProps {
  data: TodoListBlockData;
  onChange: (data: TodoListBlockData) => void;
}

function TodoListPaper({ data: rawData, onChange }: TodoListPaperProps) {
  const data = normalizeTodoListData(rawData);
  const draftInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);

  const draftDepth = draft?.parentId ? 1 : 0;

  const persistItems = useCallback(
    (items: TodoItem[]) => {
      onChange({ ...data, items });
    },
    [data, onChange]
  );

  const toggleItem = useCallback(
    (id: string) => {
      persistItems(
        updateItemInTree(data.items, id, (item) => ({ ...item, done: !item.done }))
      );
    },
    [data.items, persistItems]
  );

  const updateText = useCallback(
    (id: string, text: string) => {
      persistItems(updateItemInTree(data.items, id, (item) => ({ ...item, text })));
    },
    [data.items, persistItems]
  );

  const deleteItem = useCallback(
    (id: string) => {
      persistItems(deleteItemFromTree(data.items, id));
    },
    [data.items, persistItems]
  );

  const startDraft = useCallback(() => {
    setDraft({ text: "", parentId: null });
    requestAnimationFrame(() => draftInputRef.current?.focus());
  }, []);

  const handleExistingEnter = useCallback(() => {
    startDraft();
  }, [startDraft]);

  const handleDraftKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!draft) return;

      if (e.key === "Tab") {
        e.preventDefault();
        const flat = flattenTodoItems(data.items);
        const previousId = flat.length > 0 ? flat[flat.length - 1].id : null;
        if (previousId) {
          setDraft((prev) => (prev ? { ...prev, parentId: previousId } : prev));
        }
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        // Empty sub-item draft: promote back to top-level input
        if (draft.parentId !== null && !draft.text.trim()) {
          setDraft((prev) => (prev ? { ...prev, parentId: null } : prev));
          return;
        }

        // Commit when there is text (top-level or sub-item)
        if (draft.text.trim()) {
          const parentId = draft.parentId;
          const items = insertTodoItem(
            data.items,
            createTodoItem(draft.text.trim()),
            parentId
          );
          persistItems(items);
          // Next draft stays at same level (another sub-item under same parent)
          setDraft({ text: "", parentId });
          requestAnimationFrame(() => draftInputRef.current?.focus());
          return;
        }

        // Empty top-level draft: keep drafting
        setDraft({ text: "", parentId: null });
      }
    },
    [data.items, draft, persistItems]
  );

  const completedCount = countDone(data.items);
  const totalCount = countAll(data.items);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 2, mb: 2, position: "relative", zIndex: 1 }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          transform: "rotate(-0.6deg)",
          filter: "drop-shadow(0 2px 4px rgba(60, 40, 20, 0.08))",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -6,
            right: 36,
            width: 14,
            height: 44,
            border: "3px solid #8a8a8a",
            borderBottom: "none",
            borderRadius: "8px 8px 0 0",
            zIndex: 2,
            transform: "rotate(8deg)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            bgcolor: "#fdf6e3",
            borderRadius: "2px",
            overflow: "hidden",
            boxShadow:
              "0 1px 2px rgba(60,40,20,0.06), 0 6px 20px rgba(60,40,20,0.12), 0 16px 40px rgba(60,40,20,0.08)",
            backgroundImage: `
              linear-gradient(rgba(180, 160, 130, 0.35) 1px, transparent 1px),
              linear-gradient(90deg, transparent ${MARGIN_LEFT - 1}px, #e57373 ${MARGIN_LEFT - 1}px, #e57373 ${MARGIN_LEFT + 1}px, transparent ${MARGIN_LEFT + 1}px)
            `,
            backgroundSize: `100% ${LINE_HEIGHT}px`,
            backgroundPosition: `0 ${data.showTitle ? 56 : 24}px`,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 12,
              left: 0,
              right: 0,
              height: 20,
              background: `
                radial-gradient(circle at 18% 50%, #d4c4a8 6px, transparent 6px),
                radial-gradient(circle at 50% 50%, #d4c4a8 6px, transparent 6px),
                radial-gradient(circle at 82% 50%, #d4c4a8 6px, transparent 6px)
              `,
              pointerEvents: "none",
            },
          }}
        >
          <Box
            sx={{ position: "relative", zIndex: 1, pt: 4.5, pb: 2, pl: `${MARGIN_LEFT + 12}px`, pr: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !draft && e.target === e.currentTarget) {
                e.preventDefault();
                startDraft();
              }
            }}
          >
            {data.showTitle && (
              <Typography
                className={caveat.className}
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#3d3429",
                  mb: 1,
                  lineHeight: 1.2,
                }}
              >
                {data.title || "Things to do"}
              </Typography>
            )}

            {totalCount > 0 && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 1.5,
                  color: "#a08060",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                {completedCount} of {totalCount} done
              </Typography>
            )}

            <Box sx={{ minHeight: 40 }}>
              {data.items.length === 0 && !draft ? (
                <Typography
                  onClick={startDraft}
                  sx={{
                    color: "#c4b5a0",
                    fontStyle: "italic",
                    fontFamily: "Georgia, serif",
                    fontSize: 15,
                    lineHeight: `${LINE_HEIGHT}px`,
                    py: 1,
                    cursor: "text",
                  }}
                >
                  Click here or press Enter to add a task…
                </Typography>
              ) : (
                data.items.map((item) => (
                  <TodoItemRow
                    key={item.id}
                    item={item}
                    depth={0}
                    onToggle={toggleItem}
                    onTextChange={updateText}
                    onDelete={deleteItem}
                    onEnter={handleExistingEnter}
                  />
                ))
              )}

              {draft && (
                <DraftRow
                  draft={draft}
                  depth={draftDepth}
                  onChange={(text) => setDraft((prev) => (prev ? { ...prev, text } : prev))}
                  onKeyDown={handleDraftKeyDown}
                  inputRef={draftInputRef}
                />
              )}
            </Box>

            {!draft && data.items.length > 0 && (
              <Typography
                component="button"
                type="button"
                onClick={startDraft}
                sx={{
                  mt: 1,
                  border: "none",
                  bgcolor: "transparent",
                  cursor: "pointer",
                  color: "#a08060",
                  fontFamily: "Georgia, serif",
                  fontSize: 14,
                  fontStyle: "italic",
                  p: 0.5,
                  "&:hover": { color: "#5c4a3a" },
                }}
              >
                + Add item
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function countDone(items: TodoItem[]): number {
  return items.reduce((sum, item) => sum + (item.done ? 1 : 0) + countDone(item.children), 0);
}

function countAll(items: TodoItem[]): number {
  return items.reduce((sum, item) => sum + 1 + countAll(item.children), 0);
}

interface TodoListBlockEditorProps {
  data: TodoListBlockData;
  onChange: (data: TodoListBlockData) => void;
}

export function TodoListBlockEditor({ data, onChange }: TodoListBlockEditorProps) {
  const normalized = normalizeTodoListData(data);

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
          placeholder="Things to do"
        />
      )}
      <Typography variant="caption" color="text.secondary">
        Add and edit tasks in the live preview. Press Enter to add items, Tab on a new item for
        sub-items.
      </Typography>
    </Box>
  );
}

interface TodoListBlockPreviewProps {
  block: BlockRow;
  data: TodoListBlockData;
}

export function TodoListBlockPreview({ block, data }: TodoListBlockPreviewProps) {
  const { updateBlock } = useDocumentEditor();
  return (
    <TodoListPaper data={data} onChange={(next) => updateBlock(block.id, next)} />
  );
}
