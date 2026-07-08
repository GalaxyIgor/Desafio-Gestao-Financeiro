"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  CreditCard,
  PiggyBank,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useOverview } from "@/features/overview/api";
import { MonthlyFlowChart } from "@/features/overview/components/monthly-flow-chart";
import { BreakdownCard } from "@/features/overview/components/breakdown-card";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function OverviewPage() {
  const { data, isLoading, isError, error } = useOverview();

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Resumo financeiro do mês atual"
      />

      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar os dados:{" "}
            {error instanceof Error ? error.message : "erro desconhecido"}.
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Receitas"
              value={formatCurrency(data.metrics.totalIncome.value)}
              delta={data.metrics.totalIncome.delta}
              icon={<ArrowDownToLine className="size-4" />}
              href="/income"
            />
            <MetricCard
              title="Despesas"
              value={formatCurrency(data.metrics.totalExpenses.value)}
              delta={data.metrics.totalExpenses.delta}
              icon={<CreditCard className="size-4" />}
              href="/expenses"
            />
            <MetricCard
              title="Saldo do mês"
              value={formatCurrency(data.metrics.monthlyBalance.value)}
              delta={data.metrics.monthlyBalance.delta}
              icon={<Wallet className="size-4" />}
              href="/reports"
            />
            <MetricCard
              title="Taxa de poupança"
              value={formatPercent(data.metrics.savingsRate.value)}
              delta={data.metrics.savingsRate.delta}
              icon={<PiggyBank className="size-4" />}
              href="/reports"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <MonthlyFlowChart flow={data.monthlyFlow} />
            <InvestmentCard investment={data.investment} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="Despesas por categoria"
              href="/expenses"
              items={data.expensesByCategory.items.map((i) => ({
                label: i.category,
                amount: i.amount,
                percent: i.percent,
              }))}
            />
            <BreakdownCard
              title="Receitas por fonte"
              href="/income"
              items={data.incomeBySource.items.map((i) => ({
                label: i.source,
                amount: i.amount,
                percent: i.percent,
              }))}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <GoalsCard goals={data.goals} />
            <QuickStatsCard stats={data.quickStats} />
          </div>
        </>
      )}
    </>
  );
}

function InvestmentCard({
  investment,
}: {
  investment: NonNullable<ReturnType<typeof useOverview>["data"]>["investment"];
}) {
  const up = investment.monthChange.percent >= 0;
  return (
    <Link href="/investments" className="block">
      <Card className="h-full cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/40">
        <CardHeader>
          <CardTitle>{investment.name}</CardTitle>
          <CardDescription>{investment.indexLabel}</CardDescription>
        </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-semibold">
          {formatCurrency(investment.balance)}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Mês</p>
            <p
              className={
                up
                  ? "font-medium text-emerald-600 dark:text-emerald-400"
                  : "font-medium text-rose-600 dark:text-rose-400"
              }
            >
              {formatCurrency(investment.monthChange.amount)} (
              {formatPercent(investment.monthChange.percent)})
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Rend. ano</p>
            <p className="font-medium">{formatPercent(investment.yearYield)}</p>
          </div>
        </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function GoalsCard({
  goals,
}: {
  goals: NonNullable<ReturnType<typeof useOverview>["data"]>["goals"];
}) {
  return (
    <Link href="/goals" className="block">
      <Card className="h-full cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/40">
        <CardHeader>
        <CardTitle>Metas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma meta ativa.</p>
        )}
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{goal.name}</span>
              <span className="text-muted-foreground">
                {formatCurrency(goal.currentAmount)} /{" "}
                {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            <Progress value={goal.progressPercent} className="h-2" />
          </div>
        ))}
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickStatsCard({
  stats,
}: {
  stats: NonNullable<ReturnType<typeof useOverview>["data"]>["quickStats"];
}) {
  const items = [
    { label: "Gasto médio diário", value: formatCurrency(stats.averageDailySpend) },
    {
      label: "Maior despesa",
      value: `${formatCurrency(stats.largestExpense.amount)} · ${stats.largestExpense.category}`,
    },
    { label: "Dias restantes", value: String(stats.daysRemaining) },
    {
      label: "Sobra média diária",
      value: formatCurrency(stats.averageDailySurplus),
    },
  ];
  return (
    <Link href="/reports" className="block">
      <Card className="h-full cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/40">
        <CardHeader>
          <CardTitle>Resumo rápido</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  );
}
