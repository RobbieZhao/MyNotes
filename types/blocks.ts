export type BlockType =
  | "text"
  | "code"
  | "todo_list"
  | "timeline"
  | "multi_select"
  | "line_chart"
  | "pie_chart"
  | "bar_chart_race"
  | "choropleth_map"
  | "data_table";

export interface TextBlockData {
  content: string;
}

export interface CodeBlockData {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export interface MultiSelectBlockData {
  datasetId: string;
  label?: string;
}

export type YAxisScale =
  | "auto"
  | "raw"
  | "thousands"
  | "millions"
  | "billions"
  | "trillions"
  | "log";

export interface LineChartBlockData {
  datasetId: string;
  xColumn?: string;
  yColumn?: string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  yAxisScale?: YAxisScale;
  showLegend?: boolean;
}

export type PieValueScale = Exclude<YAxisScale, "log">;

export interface PieChartBlockData {
  datasetId: string;
  sliceYear?: number;
  labelColumn?: string;
  valueColumn?: string;
  title?: string;
  valueScale?: PieValueScale;
  showLegend?: boolean;
  showLabels?: boolean;
}

export type BarOrientation = "horizontal" | "vertical";

export interface BarChartRaceBlockData {
  datasetId: string;
  title?: string;
  labelColumn?: string;
  valueColumn?: string;
  valueScale?: PieValueScale;
  orientation?: BarOrientation;
  maxBars?: number;
  showValues?: boolean;
}

export type ChoroplethColorScheme = "blues" | "teal" | "orange" | "purple" | "viridis";

export type MapRegion = "world" | "usa";

export interface ChoroplethMapBlockData {
  datasetId: string;
  title?: string;
  mapRegion?: MapRegion;
  sliceYear?: number;
  labelColumn?: string;
  valueColumn?: string;
  valueScale?: PieValueScale;
  showLegend?: boolean;
  colorScheme?: ChoroplethColorScheme;
  enableAnimation?: boolean;
}

export interface DataTableBlockData {
  datasetId: string;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  children: TodoItem[];
}

export interface TodoListBlockData {
  title: string;
  showTitle?: boolean;
  items: TodoItem[];
}

export type TimelineItemStatus = "default" | "milestone" | "highlight";

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  status?: TimelineItemStatus;
}

export interface TimelineBlockData {
  title: string;
  showTitle?: boolean;
  items: TimelineItem[];
}

export type BlockData =
  | TextBlockData
  | CodeBlockData
  | TodoListBlockData
  | TimelineBlockData
  | MultiSelectBlockData
  | LineChartBlockData
  | PieChartBlockData
  | BarChartRaceBlockData
  | ChoroplethMapBlockData
  | DataTableBlockData;

export interface Block {
  id: string;
  document_id: string;
  position: number;
  type: BlockType;
  data: BlockData;
  created_at: string;
  updated_at: string;
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  text: "Text",
  code: "Code",
  todo_list: "Todo List",
  timeline: "Timeline",
  multi_select: "Multi Select",
  line_chart: "Line Chart",
  pie_chart: "Pie Chart",
  bar_chart_race: "Bar Chart Race",
  choropleth_map: "Choropleth Map",
  data_table: "Data Table",
};

export const DEFAULT_BLOCK_DATA: Record<BlockType, BlockData> = {
  text: { content: "" },
  code: { code: "", language: "typescript", showLineNumbers: true },
  todo_list: { title: "Things to do", showTitle: true, items: [] },
  timeline: { title: "Timeline", showTitle: true, items: [] },
  multi_select: { datasetId: "", label: "" },
  line_chart: { datasetId: "", yAxisScale: "auto", showLegend: true },
  pie_chart: { datasetId: "", valueScale: "auto", showLegend: true, showLabels: true },
  bar_chart_race: {
    datasetId: "",
    valueScale: "auto",
    orientation: "horizontal",
    maxBars: 10,
    showValues: true,
  },
  choropleth_map: {
    datasetId: "",
    mapRegion: "world",
    valueScale: "auto",
    showLegend: true,
    colorScheme: "blues",
    enableAnimation: true,
  },
  data_table: { datasetId: "" },
};
