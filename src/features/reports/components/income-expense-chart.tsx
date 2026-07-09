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

interface Series {
  label: string;
  points: { label: string; value: number }[];
}

const config = {
  income: { label: "Receitas", color: "var(--chart-1)" },
  expenses: { label: "Despesas", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function IncomeExpenseChart({
  income,
  expenses,
}: {
  income: Series;
  expenses: Series;
}) {
  const labels = income.points.map((p) => p.label);
  const rows = labels.map((label, i) => ({
    label,
    income: income.points[i]?.value ?? 0,
    expenses: expenses.points[i]?.value ?? 0,
  }));

  return (
    <ChartContainer config={config} className="h-[280px] w-full">
      <LineChart data={rows} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => formatCompact(Number(v))}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} />
        <Line
          dataKey="expenses"
          stroke="var(--color-expenses)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
