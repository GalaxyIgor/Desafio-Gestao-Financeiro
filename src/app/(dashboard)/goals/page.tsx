"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, PiggyBank, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useGoals, useDeleteGoal } from "@/features/goals/api";
import { GoalDialog, type Goal } from "@/features/goals/components/goal-dialog";
import { DepositDialog } from "@/features/goals/components/deposit-dialog";
import { priorityLabels } from "@/features/goals/schema";

export default function GoalsPage() {
  const { data, isLoading, isError } = useGoals();
  const del = useDeleteGoal();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [depositing, setDepositing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);

  return (
    <>
      <PageHeader
        title="Metas"
        description="Objetivos financeiros e aportes"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nova meta
          </Button>
        }
      />

      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar as metas.
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryTile label="Metas ativas" value={String(data.summary.activeCount)} />
            <SummaryTile
              label="Concluídas"
              value={String(data.summary.completedCount)}
            />
            <SummaryTile
              label="Total guardado"
              value={formatCurrency(data.summary.totalSaved)}
            />
          </div>

          {data.goals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma meta cadastrada ainda.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        <Badge
                          variant={
                            goal.status === "completed" ? "default" : "secondary"
                          }
                          className="mt-1"
                        >
                          {goal.status === "completed"
                            ? "Concluída"
                            : priorityLabels[goal.priority]}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" aria-label="Ações" />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDepositing(goal as Goal)}>
                          <PiggyBank className="size-4" />
                          Aportar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(goal as Goal);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(goal as Goal)}
                        >
                          <Trash2 className="size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress value={goal.progressPercent} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatPercent(goal.progressPercent, 0)}</span>
                      <span>
                        Faltam {formatCurrency(goal.remaining)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Previsão: {goal.forecastDate}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <GoalDialog open={dialogOpen} onOpenChange={setDialogOpen} goal={editing} />
      <DepositDialog
        open={Boolean(depositing)}
        onOpenChange={(o) => !o && setDepositing(null)}
        goal={depositing}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir meta?"
        description={deleting ? `"${deleting.name}" será removida.` : undefined}
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

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
