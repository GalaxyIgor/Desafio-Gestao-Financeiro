"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { MonthNavigator, currentMonth } from "@/components/month-navigator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DeltaBadge } from "@/components/delta-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useIncome, useDeleteIncomeEntry } from "@/features/income/api";
import { useReports } from "@/features/reports/api";
import {
  IncomeEntryDialog,
  type IncomeEntry,
} from "@/features/income/components/income-entry-dialog";
import { IncomeEntriesTable } from "@/features/income/components/income-entries-table";
import { IncomeHistoryChart } from "@/features/income/components/income-history-chart";

export default function IncomePage() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading, isError, error } = useIncome(month);
  // O history do /income só reporta o mês pedido (zera os anteriores), então a
  // série multi-mês real vem do /reports (incomeVsExpense.income).
  const reports = useReports();
  const del = useDeleteIncomeEntry();

  const historySeries = reports.data?.incomeVsExpense.income.points ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeEntry | null>(null);
  const [deleting, setDeleting] = useState<IncomeEntry | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(entry: IncomeEntry) {
    setEditing(entry);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Receitas"
        description="Lançamentos e fontes de receita do mês"
        action={
          <div className="flex items-center gap-2">
            <MonthNavigator value={month} onChange={setMonth} />
            <Button onClick={openNew}>
              <Plus className="size-4" />
              Nova receita
            </Button>
          </div>
        }
      />

      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar as receitas:{" "}
            {error instanceof Error ? error.message : "erro desconhecido"}.
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
                  Total recebido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatCurrency(data.summary.totalReceived.amount)}
                </div>
                <DeltaBadge delta={data.summary.totalReceived.delta} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  A receber
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatCurrency(data.summary.toReceive.amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.toReceive.pendingCount} lançamento(s) pendente(s)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Principal fonte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {data.summary.topSource}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeHistoryChart history={historySeries} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fontes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.sources.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sem fontes no período.
                  </p>
                )}
                {data.sources.map((source) => (
                  <div key={source.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{source.name}</span>
                      <span className="font-medium">
                        {formatCurrency(source.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={source.percent} className="h-2" />
                      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                        {formatPercent(source.percent, 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeEntriesTable
                entries={data.entries as IncomeEntry[]}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            </CardContent>
          </Card>
        </>
      )}

      <IncomeEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir receita?"
        description={
          deleting
            ? `"${deleting.description}" será removida permanentemente.`
            : undefined
        }
        confirmLabel="Excluir"
        loading={del.isPending}
        onConfirm={() => {
          if (!deleting) return;
          del.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
          });
        }}
      />
    </>
  );
}
