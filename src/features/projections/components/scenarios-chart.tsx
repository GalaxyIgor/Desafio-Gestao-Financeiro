"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact } from "@/lib/format";

interface Scenario {
  id: string;
  name: string;
  type: string;
  points: { label: string; value: number }[];
}

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

export function ScenariosChart({ scenarios }: { scenarios: Scenario[] }) {
  const labels = scenarios[0]?.points.map((p) => p.label) ?? [];
  const rows = labels.map((label, i) => {
    const row: Record<string, string | number> = { label };
    scenarios.forEach((s) => {
      row[s.id] = s.points[i]?.value ?? 0;
    });
    return row;
  });

  const config: ChartConfig = {};
  scenarios.forEach((s, i) => {
    config[s.id] = { label: s.name, color: COLORS[i % COLORS.length] };
  });

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <LineChart data={rows} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v) => formatCompact(Number(v))}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {scenarios.map((s) => (
          <Line
            key={s.id}
            dataKey={s.id}
            stroke={`var(--color-${s.id})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
