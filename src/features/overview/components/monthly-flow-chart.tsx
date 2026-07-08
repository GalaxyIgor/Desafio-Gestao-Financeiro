"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SeeMoreButton } from "@/components/see-more-button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact } from "@/lib/format";

interface Series {
  id: string;
  label: string;
  color: string;
  points: { label: string; value: number }[];
}

interface MonthlyFlow {
  income: Series;
  expenses: Series;
  balance: Series;
}

const chartConfig = {
  income: { label: "Receitas", color: "var(--chart-1)" },
  expenses: { label: "Despesas", color: "var(--chart-2)" },
  balance: { label: "Saldo", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function MonthlyFlowChart({ flow }: { flow: MonthlyFlow }) {
  const labels = flow.income.points.map((p) => p.label);
  const rows = labels.map((label, i) => ({
    label,
    income: flow.income.points[i]?.value ?? 0,
    expenses: flow.expenses.points[i]?.value ?? 0,
    balance: flow.balance.points[i]?.value ?? 0,
  }));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Fluxo mensal</CardTitle>
        <CardDescription>Receitas, despesas e saldo</CardDescription>
        <CardAction>
          <SeeMoreButton href="/reports" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <LineChart data={rows} margin={{ left: 4, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => formatCompact(Number(v))}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="income"
              stroke="var(--color-income)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="expenses"
              stroke="var(--color-expenses)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="balance"
              stroke="var(--color-balance)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
