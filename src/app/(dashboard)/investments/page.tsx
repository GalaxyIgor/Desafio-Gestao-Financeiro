"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeltaBadge } from "@/components/delta-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInvestments, useDeleteAsset } from "@/features/investments/api";
import { AssetDialog, type Asset } from "@/features/investments/components/asset-dialog";
import {
  AllocationChart,
  EvolutionChart,
} from "@/features/investments/components/investments-charts";

const LEGEND_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function InvestmentsPage() {
  const { data, isLoading, isError } = useInvestments();
  const del = useDeleteAsset();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState<Asset | null>(null);

  return (
    <>
      <PageHeader
        title="Investimentos"
        description="Alocação, evolução e ativos da carteira"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Novo ativo
          </Button>
        }
      />

      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar os investimentos.
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
                  Patrimônio investido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatCurrency(data.summary.investedNetWorth.amount)}
                </div>
                <DeltaBadge delta={data.summary.investedNetWorth.delta} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rendimento no mês
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatCurrency(data.summary.monthlyYield.amount)}
                </div>
                <DeltaBadge delta={data.summary.monthlyYield.delta} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rendimento no ano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {formatCurrency(data.summary.yearlyYield.amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(data.summary.yearlyYield.returnPercentYtd)} no ano
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Alocação</CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationChart items={data.allocation.items} />
                <div className="mt-4 space-y-2">
                  {data.allocation.items.map((item, i) => (
                    <div
                      key={item.assetClass}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              LEGEND_COLORS[i % LEGEND_COLORS.length],
                          }}
                        />
                        {item.assetClass}
                      </span>
                      <span className="text-muted-foreground">
                        {formatPercent(item.percent, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução</CardTitle>
              </CardHeader>
              <CardContent>
                <EvolutionChart data={data.evolution} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {data.assets.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum ativo cadastrado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">Peso</TableHead>
                        <TableHead className="text-right">Mês</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div className="font-medium">{asset.name}</div>
                            {asset.subtitle && (
                              <div className="text-xs text-muted-foreground">
                                {asset.subtitle}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {asset.assetClass}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(asset.currentBalance)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatPercent(asset.weightPercent, 0)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right",
                              asset.monthlyYield.percent >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {formatPercent(asset.monthlyYield.percent)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Ações"
                                  />
                                }
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditing(asset as Asset);
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="size-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleting(asset as Asset)}
                                >
                                  <Trash2 className="size-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <AssetDialog open={dialogOpen} onOpenChange={setDialogOpen} asset={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir ativo?"
        description={deleting ? `"${deleting.name}" será removido.` : undefined}
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
