"use client";

import { useState } from "react";

type TodoItem = {
  text: string;
  done?: boolean;
};

export default function TodoList({
  title = "To-do",
  items,
}: {
  title?: string;
  items: TodoItem[];
}) {
  const [todos, setTodos] = useState(
    items.map((item) => ({ ...item, done: item.done ?? false }))
  );

  function toggle(index: number) {
    setTodos((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
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

        <h4 className="relative mb-3 border-b border-[#ca8a04]/40 pb-2 font-semibold text-[#713f12] dark:text-[#fde68a]">
          {title}
        </h4>

        <ul className="relative space-y-2">
          {todos.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => toggle(index)}
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
              <span
                className={`text-sm leading-snug text-[#713f12] dark:text-[#fef3c7] ${
                  item.done ? "line-through opacity-60" : ""
                }`}
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
