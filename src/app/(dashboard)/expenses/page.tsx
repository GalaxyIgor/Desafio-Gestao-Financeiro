"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DeltaBadge } from "@/components/delta-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  useExpensesOverview,
  useExpenseEntries,
  useDeleteExpense,
} from "@/features/expenses/api";
import {
  ExpenseEntryDialog,
  type ExpenseEntry,
} from "@/features/expenses/components/expense-entry-dialog";
import { ExpensesTable } from "@/features/expenses/components/expenses-table";
import { LimitDialog } from "@/features/expenses/components/limit-dialog";

export default function ExpensesPage() {
  const overview = useExpensesOverview();
  const entries = useExpenseEntries();
  const del = useDeleteExpense();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseEntry | null>(null);
  const [deleting, setDeleting] = useState<ExpenseEntry | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(entry: ExpenseEntry) {
    setEditing(entry);
    setDialogOpen(true);
  }

  const ov = overview.data;

  return (
    <>
      <PageHeader
        title="Despesas"
        description="Gastos, limite mensal e categorias"
        action={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nova despesa
          </Button>
        }
      />

      {overview.isError && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar as despesas.
          </CardContent>
        </Card>
      )}

      {overview.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {ov && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total gasto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatCurrency(ov.summary.totalSpent.amount)}
                </div>
                <DeltaBadge delta={ov.summary.totalSpent.delta} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Limite mensal
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLimitOpen(true)}
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold">
                    {formatCurrency(ov.summary.monthlyLimit.spent)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    de {formatCurrency(ov.summary.monthlyLimit.limit)}
                  </span>
                </div>
                <Progress value={ov.summary.monthlyLimit.usedPercent} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {formatPercent(ov.summary.monthlyLimit.usedPercent, 0)}{" "}
                    utilizado
                  </span>
                  <span>
                    Resta {formatCurrency(ov.summary.monthlyLimit.remaining)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Por categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ov.byCategory.items.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Sem despesas no período.
                </p>
              )}
              {ov.byCategory.items.map((item) => (
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
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <ExpensesTable
              entries={(entries.data ?? []) as ExpenseEntry[]}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          )}
        </CardContent>
      </Card>

      <ExpenseEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editing}
      />

      <LimitDialog
        open={limitOpen}
        onOpenChange={setLimitOpen}
        currentLimit={ov?.summary.monthlyLimit.limit ?? 0}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir despesa?"
        description={
          deleting
            ? `"${deleting.description}" será removida permanentemente.`
            : undefined
        }
        confirmLabel="Excluir"
        loading={del.isPending}
        onConfirm={() => {
          if (!deleting) return;
          del.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </>
  );
}
