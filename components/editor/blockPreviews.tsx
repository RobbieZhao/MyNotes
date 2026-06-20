import type { ReactNode } from "react";
import type { BlockType } from "@/types/blocks";

interface BlockPreviewProps {
  type: BlockType;
}

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 100" width="100%" height="100%" aria-hidden>
      <rect width="160" height="100" rx="6" fill="#fafafa" stroke="#e0e0e0" strokeWidth="1" />
      {children}
    </svg>
  );
}

function TextPreview() {
  return (
    <PreviewFrame>
      <rect x="14" y="16" width="72" height="6" rx="2" fill="#1565c0" opacity="0.85" />
      <rect x="14" y="30" width="132" height="4" rx="1.5" fill="#bdbdbd" />
      <rect x="14" y="40" width="120" height="4" rx="1.5" fill="#bdbdbd" />
      <rect x="14" y="50" width="108" height="4" rx="1.5" fill="#bdbdbd" />
      <rect x="14" y="64" width="6" height="6" rx="1" fill="#1565c0" opacity="0.5" />
      <rect x="26" y="65" width="80" height="4" rx="1.5" fill="#9e9e9e" />
      <rect x="14" y="76" width="6" height="6" rx="1" fill="#1565c0" opacity="0.5" />
      <rect x="26" y="77" width="64" height="4" rx="1.5" fill="#9e9e9e" />
    </PreviewFrame>
  );
}

function CodePreview() {
  return (
    <PreviewFrame>
      <rect x="10" y="10" width="140" height="80" rx="4" fill="#1e1e2e" />
      <rect x="18" y="20" width="48" height="3" rx="1" fill="#c792ea" />
      <rect x="26" y="30" width="72" height="3" rx="1" fill="#82aaff" />
      <rect x="26" y="38" width="56" height="3" rx="1" fill="#addb67" />
      <rect x="26" y="46" width="88" height="3" rx="1" fill="#ffcb6b" />
      <rect x="18" y="56" width="40" height="3" rx="1" fill="#c792ea" />
      <rect x="26" y="64" width="64" height="3" rx="1" fill="#f07178" />
      <rect x="26" y="72" width="48" height="3" rx="1" fill="#82aaff" />
    </PreviewFrame>
  );
}

function TodoListPreview() {
  return (
    <PreviewFrame>
      <rect x="14" y="14" width="56" height="5" rx="2" fill="#424242" />
      <rect x="14" y="30" width="10" height="10" rx="2" fill="none" stroke="#1565c0" strokeWidth="1.5" />
      <rect x="30" y="33" width="72" height="4" rx="1.5" fill="#757575" />
      <rect x="14" y="46" width="10" height="10" rx="2" fill="#1565c0" opacity="0.2" stroke="#1565c0" strokeWidth="1.5" />
      <line x1="16" y1="51" x2="22" y2="45" stroke="#1565c0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="51" x2="24" y2="49" stroke="#1565c0" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="30" y="49" width="64" height="4" rx="1.5" fill="#bdbdbd" />
      <rect x="26" y="62" width="10" height="10" rx="2" fill="none" stroke="#9e9e9e" strokeWidth="1.5" />
      <rect x="42" y="65" width="56" height="4" rx="1.5" fill="#9e9e9e" />
      <rect x="26" y="78" width="10" height="10" rx="2" fill="none" stroke="#9e9e9e" strokeWidth="1.5" />
      <rect x="42" y="81" width="48" height="4" rx="1.5" fill="#9e9e9e" />
    </PreviewFrame>
  );
}

function TimelinePreview() {
  return (
    <PreviewFrame>
      <line x1="36" y1="14" x2="36" y2="88" stroke="#1565c0" strokeWidth="2" opacity="0.35" />
      <circle cx="36" cy="24" r="5" fill="#1565c0" />
      <rect x="50" y="18" width="48" height="4" rx="1.5" fill="#424242" />
      <rect x="50" y="26" width="72" height="3" rx="1.5" fill="#bdbdbd" />
      <circle cx="36" cy="48" r="5" fill="#fff" stroke="#1565c0" strokeWidth="2" />
      <rect x="50" y="42" width="56" height="4" rx="1.5" fill="#424242" />
      <rect x="50" y="50" width="64" height="3" rx="1.5" fill="#bdbdbd" />
      <circle cx="36" cy="72" r="5" fill="#ff9800" />
      <rect x="50" y="66" width="40" height="4" rx="1.5" fill="#424242" />
      <rect x="50" y="74" width="80" height="3" rx="1.5" fill="#bdbdbd" />
    </PreviewFrame>
  );
}

function MultiSelectPreview() {
  return (
    <PreviewFrame>
      <rect x="14" y="14" width="48" height="4" rx="1.5" fill="#757575" />
      <rect x="14" y="24" width="132" height="22" rx="4" fill="#fff" stroke="#bdbdbd" strokeWidth="1" />
      <rect x="20" y="30" width="36" height="10" rx="5" fill="#1565c0" opacity="0.15" stroke="#1565c0" strokeWidth="1" />
      <rect x="22" y="33" width="20" height="4" rx="1" fill="#1565c0" opacity="0.7" />
      <rect x="60" y="30" width="28" height="10" rx="5" fill="#1565c0" opacity="0.15" stroke="#1565c0" strokeWidth="1" />
      <rect x="62" y="33" width="16" height="4" rx="1" fill="#1565c0" opacity="0.7" />
      <polygon points="138,32 142,36 138,40" fill="#9e9e9e" />
      <rect x="14" y="56" width="132" height="32" rx="4" fill="#fff" stroke="#e0e0e0" strokeWidth="1" />
      <rect x="20" y="62" width="10" height="10" rx="2" fill="#1565c0" opacity="0.8" />
      <rect x="34" y="65" width="48" height="4" rx="1.5" fill="#616161" />
      <rect x="20" y="76" width="10" height="10" rx="2" fill="#1565c0" opacity="0.8" />
      <rect x="34" y="79" width="56" height="4" rx="1.5" fill="#616161" />
    </PreviewFrame>
  );
}

function LineChartPreview() {
  return (
    <PreviewFrame>
      <line x1="20" y1="82" x2="148" y2="82" stroke="#e0e0e0" strokeWidth="1" />
      <line x1="20" y1="18" x2="20" y2="82" stroke="#e0e0e0" strokeWidth="1" />
      <polyline
        points="24,68 44,52 64,58 84,32 104,38 124,22 144,28"
        fill="none"
        stroke="#1565c0"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="24,72 44,62 64,48 84,52 104,42 124,48 144,36"
        fill="none"
        stroke="#42a5f5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </PreviewFrame>
  );
}

function PieChartPreview() {
  return (
    <PreviewFrame>
      <circle cx="72" cy="50" r="32" fill="#e3f2fd" />
      <path d="M72,50 L72,18 A32,32 0 0,1 98,62 Z" fill="#1565c0" />
      <path d="M72,50 L98,62 A32,32 0 0,1 52,78 Z" fill="#42a5f5" />
      <path d="M72,50 L52,78 A32,32 0 0,1 72,18 Z" fill="#90caf9" />
      <rect x="118" y="28" width="8" height="8" rx="2" fill="#1565c0" />
      <rect x="130" y="30" width="24" height="4" rx="1.5" fill="#bdbdbd" />
      <rect x="118" y="42" width="8" height="8" rx="2" fill="#42a5f5" />
      <rect x="130" y="44" width="20" height="4" rx="1.5" fill="#bdbdbd" />
      <rect x="118" y="56" width="8" height="8" rx="2" fill="#90caf9" />
      <rect x="130" y="58" width="16" height="4" rx="1.5" fill="#bdbdbd" />
    </PreviewFrame>
  );
}

function BarChartRacePreview() {
  return (
    <PreviewFrame>
      <rect x="14" y="18" width="100" height="10" rx="3" fill="#1565c0" />
      <rect x="14" y="34" width="80" height="10" rx="3" fill="#42a5f5" />
      <rect x="14" y="50" width="64" height="10" rx="3" fill="#64b5f6" />
      <rect x="14" y="66" width="48" height="10" rx="3" fill="#90caf9" />
      <rect x="14" y="82" width="36" height="10" rx="3" fill="#bbdefb" />
      <rect x="118" y="20" width="28" height="6" rx="2" fill="#e0e0e0" />
      <rect x="118" y="36" width="24" height="6" rx="2" fill="#e0e0e0" />
      <rect x="118" y="52" width="20" height="6" rx="2" fill="#e0e0e0" />
    </PreviewFrame>
  );
}

function DataTablePreview() {
  return (
    <PreviewFrame>
      <rect x="10" y="12" width="140" height="76" rx="4" fill="#fff" stroke="#e0e0e0" strokeWidth="1" />
      <rect x="10" y="12" width="140" height="16" rx="4" fill="#f5f5f5" />
      <line x1="10" y1="28" x2="150" y2="28" stroke="#e0e0e0" strokeWidth="1" />
      <rect x="16" y="17" width="28" height="4" rx="1" fill="#616161" />
      <rect x="56" y="17" width="24" height="4" rx="1" fill="#616161" />
      <rect x="96" y="17" width="32" height="4" rx="1" fill="#616161" />
      <line x1="52" y1="12" x2="52" y2="88" stroke="#eeeeee" strokeWidth="1" />
      <line x1="92" y1="12" x2="92" y2="88" stroke="#eeeeee" strokeWidth="1" />
      <line x1="10" y1="44" x2="150" y2="44" stroke="#eeeeee" strokeWidth="1" />
      <line x1="10" y1="60" x2="150" y2="60" stroke="#eeeeee" strokeWidth="1" />
      <line x1="10" y1="76" x2="150" y2="76" stroke="#eeeeee" strokeWidth="1" />
      <rect x="16" y="34" width="24" height="3" rx="1" fill="#bdbdbd" />
      <rect x="56" y="34" width="20" height="3" rx="1" fill="#bdbdbd" />
      <rect x="96" y="34" width="16" height="3" rx="1" fill="#bdbdbd" />
      <rect x="16" y="50" width="32" height="3" rx="1" fill="#bdbdbd" />
      <rect x="56" y="50" width="18" height="3" rx="1" fill="#bdbdbd" />
      <rect x="96" y="50" width="24" height="3" rx="1" fill="#bdbdbd" />
      <rect x="16" y="66" width="20" height="3" rx="1" fill="#bdbdbd" />
      <rect x="56" y="66" width="22" height="3" rx="1" fill="#bdbdbd" />
      <rect x="96" y="66" width="20" height="3" rx="1" fill="#bdbdbd" />
    </PreviewFrame>
  );
}

const PREVIEW_MAP: Partial<Record<BlockType, () => ReactNode>> = {
  text: TextPreview,
  code: CodePreview,
  todo_list: TodoListPreview,
  timeline: TimelinePreview,
  multi_select: MultiSelectPreview,
  line_chart: LineChartPreview,
  pie_chart: PieChartPreview,
  bar_chart_race: BarChartRacePreview,
  data_table: DataTablePreview,
};

export function BlockPreview({ type }: BlockPreviewProps) {
  const Preview = PREVIEW_MAP[type];
  if (!Preview) {
    return (
      <PreviewFrame>
        <rect x="60" y="44" width="40" height="12" rx="3" fill="#e0e0e0" />
      </PreviewFrame>
    );
  }
  return <Preview />;
}

export const BLOCK_DESCRIPTIONS: Partial<Record<BlockType, string>> = {
  text: "Rich markdown text with headings, lists, and formatting",
  code: "Syntax-highlighted code with language support",
  todo_list: "Nested checklists to track tasks and progress",
  timeline: "Chronological events, milestones, and highlights",
  multi_select: "Filter and explore data with multi-select controls",
  line_chart: "Track trends and time series over continuous data",
  pie_chart: "Show proportions and composition at a glance",
  bar_chart_race: "Animated ranking bars that change over time",
  data_table: "Sortable, searchable tabular data views",
};
