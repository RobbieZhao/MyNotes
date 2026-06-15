"use client";

import { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import SaveStatus from "@/components/editor/SaveStatus";
import { useNoteContext } from "@/components/NoteContextProvider";
import { useComponentState } from "@/hooks/useComponentState";
import type { TodoListData } from "@/lib/types";

const DEFAULT_DATA: TodoListData = {
  title: "To-do",
  items: [],
};

function createItem(text: string) {
  return {
    id: crypto.randomUUID(),
    text,
    done: false,
  };
}

export default function TodoList({ componentKey }: { componentKey: string }) {
  const { noteId } = useNoteContext();
  const { data, setData, loading, saveStatus } = useComponentState<TodoListData>({
    noteId,
    componentKey,
    componentType: "TodoList",
    initialData: DEFAULT_DATA,
  });
  const [newItemText, setNewItemText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function toggle(id: string) {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  }

  function addItem() {
    const text = newItemText.trim();
    if (!text) return;
    setData((prev) => ({
      ...prev,
      items: [...prev.items, createItem(text)],
    }));
    setNewItemText("");
  }

  function deleteItem(id: string) {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }

  function startEdit(id: string, text: string) {
    setEditingId(id);
    setEditText(text);
  }

  function commitEdit() {
    if (!editingId) return;
    const text = editText.trim();
    if (!text) {
      deleteItem(editingId);
    } else {
      setData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === editingId ? { ...item, text } : item
        ),
      }));
    }
    setEditingId(null);
    setEditText("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  if (loading) {
    return (
      <div className="my-6 flex justify-center py-4">
        <CircularProgress size={24} />
      </div>
    );
  }

  return (
    <div className="my-6 w-full max-w-md rotate-[-0.5deg]">
      <div className="relative overflow-hidden rounded-sm bg-[#fef9c3] px-5 py-4 shadow-[2px_3px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#422006] dark:shadow-[2px_3px_8px_rgba(0,0,0,0.4)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, #ca8a04 28px)",
            backgroundSize: "100% 28px",
          }}
        />
        <div className="pointer-events-none absolute top-0 right-0 h-6 w-6 bg-linear-to-br from-[#fde047]/60 to-[#ca8a04]/30 dark:from-[#78350f]/60 dark:to-[#451a03]/30" />

        <div className="relative mb-3 flex items-center justify-between border-b border-[#ca8a04]/40 pb-2">
          <h4 className="font-semibold text-[#713f12] dark:text-[#fde68a]">
            {data.title}
          </h4>
          <SaveStatus status={saveStatus} />
        </div>

        <ul className="relative space-y-2">
          {data.items.map((item) => (
            <li key={item.id} className="group flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-label={item.done ? "Mark incomplete" : "Mark complete"}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
                  item.done
                    ? "border-[#a16207] bg-[#a16207] text-white dark:border-[#fde68a] dark:bg-[#fde68a] dark:text-[#422006]"
                    : "border-[#ca8a04]/70 bg-[#fefce8] dark:border-[#fde68a]/50 dark:bg-[#422006]"
                }`}
              >
                {item.done && (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-2.5 w-2.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </button>

              {editingId === item.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                  className="min-w-0 flex-1 rounded border border-[#ca8a04]/50 bg-[#fefce8] px-1.5 py-0.5 text-sm text-[#713f12] outline-none focus:border-[#a16207] dark:border-[#fde68a]/50 dark:bg-[#422006] dark:text-[#fef3c7]"
                />
              ) : (
                <span
                  onDoubleClick={() => startEdit(item.id, item.text)}
                  className={`min-w-0 flex-1 cursor-text text-sm leading-snug text-[#713f12] dark:text-[#fef3c7] ${
                    item.done ? "line-through opacity-60" : ""
                  }`}
                >
                  {item.text}
                </span>
              )}

              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                aria-label="Delete item"
                className="mt-0.5 shrink-0 rounded p-0.5 text-[#a16207]/0 transition-colors group-hover:text-[#a16207]/70 hover:!text-[#a16207] dark:group-hover:text-[#fde68a]/70 dark:hover:!text-[#fde68a]"
              >
                <svg
                  viewBox="0 0 12 12"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <form
          className="relative mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addItem();
          }}
        >
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add an item…"
            className="min-w-0 flex-1 rounded border border-[#ca8a04]/50 bg-[#fefce8] px-2 py-1 text-sm text-[#713f12] placeholder:text-[#a16207]/50 outline-none focus:border-[#a16207] dark:border-[#fde68a]/50 dark:bg-[#422006] dark:text-[#fef3c7] dark:placeholder:text-[#fde68a]/40"
          />
          <button
            type="submit"
            disabled={!newItemText.trim()}
            className="shrink-0 rounded bg-[#a16207] px-2.5 py-1 text-xs font-medium text-white transition-opacity disabled:opacity-40 dark:bg-[#fde68a] dark:text-[#422006]"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
