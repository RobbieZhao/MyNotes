import type { BlockData, BlockType } from "./blocks";
import type { DatasetConfig } from "./dataset";

export interface Document {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface BlockGroup {
  id: string;
  document_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BlockRow {
  id: string;
  document_id: string;
  position: number;
  type: BlockType;
  data: BlockData;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export type DatasetRow = Record<string, string | number>;

export interface Dataset {
  id: string;
  user_id: string;
  name: string;
  data: DatasetRow[];
  config: DatasetConfig;
  created_at: string;
  updated_at: string;
}
