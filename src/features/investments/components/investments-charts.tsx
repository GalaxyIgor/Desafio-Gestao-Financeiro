"use client";

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact } from "@/lib/format";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const emptyConfig = {} satisfies ChartConfig;

export function AllocationChart({
  items,
}: {
  items: { assetClass: string; percent: number }[];
}) {
  return (
    <ChartContainer
      config={emptyConfig}
      className="mx-auto aspect-square max-h-[220px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="assetClass" />} />
        <Pie
          data={items}
          dataKey="percent"
          nameKey="assetClass"
          innerRadius={55}
          strokeWidth={2}
        >
          {items.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

const evolutionConfig = {
  value: { label: "Patrimônio", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function EvolutionChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <ChartContainer config={evolutionConfig} className="h-[220px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => formatCompact(Number(v))}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          fill="var(--color-value)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
