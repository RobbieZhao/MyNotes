"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

type PieChartData = {
  name: string;
  value: number;
};

type PieChartWidgetProps = {
  title?: string;
  data: PieChartData[];
  height?: number;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
  "#FF6699",
];

export default function PieChartWidget({
  title,
  data,
  height = 300,
}: PieChartWidgetProps) {
  return (
    <div className="my-6 w-full">
      {title && (
        <h3 className="mb-4 text-lg font-semibold">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
