"use client";

import type {
  BarChartRaceBlockData,
  BlockData,
  BlockType,
  CodeBlockData,
  LineChartBlockData,
  MultiSelectBlockData,
  PieChartBlockData,
  TodoListBlockData,
} from "@/types/blocks";
import type { BlockRow, Dataset } from "@/types/database";
import { BarChartRaceBlockEditor, BarChartRaceBlockPreview } from "./BarChartRaceBlock";
import { CodeBlockEditor, CodeBlockPreview } from "./CodeBlock";
import { DataTableBlockEditor, DataTableBlockPreview } from "./DataTableBlock";
import { DatasetBlockEditor, DatasetBlockPreview } from "./DatasetBlock";
import { LineChartBlockEditor, LineChartBlockPreview } from "./LineChartBlock";
import { MultiSelectBlockEditor, MultiSelectBlockPreview } from "./MultiSelectBlock";
import { PieChartBlockEditor, PieChartBlockPreview } from "./PieChartBlock";
import { TextBlockEditor, TextBlockPreview } from "./TextBlock";
import { TodoListBlockEditor, TodoListBlockPreview } from "./TodoListBlock";

interface BlockEditorProps {
  block: BlockRow;
  datasets: Dataset[];
  onChange: (data: BlockData) => void;
}

export function BlockEditor({ block, datasets, onChange }: BlockEditorProps) {
  switch (block.type) {
    case "text":
      return (
        <TextBlockEditor
          data={block.data as { content: string }}
          onChange={onChange}
        />
      );
    case "code":
      return (
        <CodeBlockEditor
          data={block.data as CodeBlockData}
          onChange={onChange}
        />
      );
    case "todo_list":
      return (
        <TodoListBlockEditor
          data={block.data as TodoListBlockData}
          onChange={onChange}
        />
      );
    case "dataset":
      return (
        <DatasetBlockEditor
          data={block.data as { datasetId: string }}
          onChange={onChange}
          datasets={datasets}
        />
      );
    case "multi_select":
    case "country_selector":
      return (
        <MultiSelectBlockEditor
          data={block.data as MultiSelectBlockData}
          onChange={onChange}
          datasets={datasets}
        />
      );
    case "line_chart":
      return (
        <LineChartBlockEditor
          data={block.data as LineChartBlockData}
          onChange={onChange}
          datasets={datasets}
        />
      );
    case "pie_chart":
      return (
        <PieChartBlockEditor
          data={block.data as PieChartBlockData}
          onChange={onChange}
          datasets={datasets}
        />
      );
    case "bar_chart_race":
      return (
        <BarChartRaceBlockEditor
          data={block.data as BarChartRaceBlockData}
          onChange={onChange}
          datasets={datasets}
        />
      );
    case "data_table":
      return (
        <DataTableBlockEditor
          data={block.data as { datasetId: string }}
          onChange={onChange}
          datasets={datasets}
        />
      );
    default:
      return null;
  }
}

interface BlockPreviewProps {
  block: BlockRow;
  datasets: Dataset[];
  allBlocks: BlockRow[];
}

export function BlockPreview({ block, datasets, allBlocks }: BlockPreviewProps) {
  switch (block.type as BlockType) {
    case "text":
      return <TextBlockPreview data={block.data as { content: string }} />;
    case "code":
      return <CodeBlockPreview data={block.data as CodeBlockData} />;
    case "todo_list":
      return (
        <TodoListBlockPreview
          block={block}
          data={block.data as TodoListBlockData}
        />
      );
    case "dataset":
      return (
        <DatasetBlockPreview
          data={block.data as { datasetId: string }}
          datasets={datasets}
        />
      );
    case "multi_select":
    case "country_selector":
      return (
        <MultiSelectBlockPreview
          data={block.data as MultiSelectBlockData}
          datasets={datasets}
          groupId={block.group_id}
        />
      );
    case "line_chart":
      return (
        <LineChartBlockPreview
          data={block.data as LineChartBlockData}
          datasets={datasets}
          block={block}
          allBlocks={allBlocks}
        />
      );
    case "pie_chart":
      return (
        <PieChartBlockPreview
          data={block.data as PieChartBlockData}
          datasets={datasets}
          groupId={block.group_id}
        />
      );
    case "bar_chart_race":
      return (
        <BarChartRaceBlockPreview
          data={block.data as BarChartRaceBlockData}
          datasets={datasets}
          groupId={block.group_id}
        />
      );
    case "data_table":
      return (
        <DataTableBlockPreview
          data={block.data as { datasetId: string }}
          datasets={datasets}
        />
      );
    default:
      return null;
  }
}
