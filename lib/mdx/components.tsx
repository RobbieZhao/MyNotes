import type { ComponentPropsWithoutRef } from "react";

import Counter from "@/components/mdx/Counter";
import TodoList from "@/components/mdx/TodoList";
import PieChartWidget from "@/components/charts/PieChartWidget";

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-4xl font-bold mb-6" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-3xl font-semibold mb-4 mt-8" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-2xl font-semibold mb-3 mt-6" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-4 leading-relaxed" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="underline text-blue-600 hover:text-blue-800" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-4 border-zinc-300 pl-4 italic my-4 text-zinc-600 dark:text-zinc-400"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded overflow-x-auto mb-4 text-sm font-mono"
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-zinc-200 dark:border-zinc-700" {...props} />
  ),
  Counter,
  TodoList,
  PieChartWidget,
};
