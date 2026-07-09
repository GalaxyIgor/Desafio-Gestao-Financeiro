"use client";

import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeltaBadge } from "@/components/delta-badge";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useReports } from "@/features/reports/api";
import { IncomeExpenseChart } from "@/features/reports/components/income-expense-chart";

const RANGES = [
  { value: "3m", label: "Últimos 3 meses" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "12m", label: "Últimos 12 meses" },
];

export default function ReportsPage() {
  const [range, setRange] = useState("6m");
  const { data, isLoading, isError } = useReports(range);

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Análises e comparativos financeiros"
        action={
          <Select value={range} onValueChange={(v) => setRange(v ?? "6m")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar os relatórios.
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita média
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatCurrency(data.kpis.averageIncome.amount)}
                </div>
                <DeltaBadge delta={data.kpis.averageIncome.delta} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Despesa média
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatCurrency(data.kpis.averageExpense.amount)}
                </div>
                <DeltaBadge delta={data.kpis.averageExpense.delta} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de poupança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatPercent(data.kpis.averageSavingsRate.percent)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Meta: {formatPercent(data.kpis.averageSavingsRate.targetPercent)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receitas × Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart
                income={data.incomeVsExpense.income}
                expenses={data.incomeVsExpense.expenses}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.expensesByCategory.items.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{item.category}</span>
                      <span className="font-medium">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={item.percent} className="h-2" />
                      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                        {formatPercent(item.percent, 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Receitas</TableHead>
                        <TableHead className="text-right">Despesas</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.monthlySummary.map((row) => (
                        <TableRow key={row.period}>
                          <TableCell className="font-medium">
                            {row.period}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.income)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.expenses)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-medium",
                              row.balance >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {formatCurrency(row.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
