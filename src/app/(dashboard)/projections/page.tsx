"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useProjections } from "@/features/projections/api";
import { ScenariosChart } from "@/features/projections/components/scenarios-chart";
import { AssumptionsDialog } from "@/features/projections/components/assumptions-dialog";

export default function ProjectionsPage() {
  const { data, isLoading, isError } = useProjections();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Projeções"
        description="Cenários patrimoniais e premissas"
        action={
          <Button variant="outline" onClick={() => setEditOpen(true)} disabled={!data}>
            <SlidersHorizontal className="size-4" />
            Premissas
          </Button>
        }
      />

      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-sm text-destructive">
            Não foi possível carregar as projeções.
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryTile
              label="Patrimônio inicial"
              value={formatCurrency(data.summary.initialNetWorth)}
            />
            <SummaryTile
              label="Aporte mensal"
              value={formatCurrency(data.summary.plannedMonthlyContribution)}
            />
            <SummaryTile
              label="Rentab. estimada"
              value={formatPercent(data.summary.estimatedAnnualRatePercent)}
            />
            <SummaryTile
              label="Projeção em 10 anos"
              value={formatCurrency(data.summary.projectionIn10Years)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cenários</CardTitle>
            </CardHeader>
            <CardContent>
              <ScenariosChart scenarios={data.scenarios} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Composição no horizonte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.compositionAtHorizon.items.map((item) => (
                <div key={item.assetClass} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{item.assetClass}</span>
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

          <AssumptionsDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            initial={{
              plannedMonthlyContribution: data.summary.plannedMonthlyContribution,
              estimatedAnnualRatePercent: data.summary.estimatedAnnualRatePercent,
              inflationPercent: data.assumptions.inflationPercent,
              contributionGrowthPercent: data.assumptions.contributionGrowthPercent,
            }}
            returnsByClass={data.assumptions.returnsByClass}
          />
        </>
      )}
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
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
