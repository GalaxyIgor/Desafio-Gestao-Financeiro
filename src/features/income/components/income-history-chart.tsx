"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact } from "@/lib/format";

const chartConfig = {
  value: { label: "Recebido", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** Histórico de receitas. Valores vêm em centavos → convertidos para reais. */
export function IncomeHistoryChart({
  history,
}: {
  history: { label: string; value: number }[];
}) {
  const rows = history.map((h) => ({ label: h.label, value: h.value / 100 }));

  return (
    <ChartContainer config={chartConfig} className="h-[240px] w-full">
      <BarChart data={rows} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => formatCompact(Number(v))}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
