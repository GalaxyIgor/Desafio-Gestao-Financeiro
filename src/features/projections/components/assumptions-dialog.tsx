"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { useUpdateAssumptions } from "../api";

const schema = z.object({
  plannedMonthlyContribution: z.number().min(0),
  estimatedAnnualRatePercent: z.number(),
  inflationPercent: z.number(),
  contributionGrowthPercent: z.number(),
});
type Values = z.infer<typeof schema>;

interface ReturnsByClass {
  assetClass: string;
  annualRatePercent: number;
}

export function AssumptionsDialog({
  open,
  onOpenChange,
  initial,
  returnsByClass,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Values;
  returnsByClass: ReturnsByClass[];
}) {
  const update = useUpdateAssumptions();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });

  useEffect(() => {
    if (open) reset(initial);
  }, [open, initial, reset]);

  function onSubmit(values: Values) {
    update.mutate(
      { ...values, returnsByClass },
      {
        onSuccess: () => {
          toast.success("Premissas atualizadas");
          onOpenChange(false);
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Premissas da projeção</DialogTitle>
          <DialogDescription>
            Ajuste os parâmetros usados no cálculo.
          </DialogDescription>
        </DialogHeader>

        <form
          id="assumptions-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="contribution">Aporte mensal planejado</Label>
            <MoneyInput
              id="contribution"
              {...register("plannedMonthlyContribution", { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rate">Rentab. a.a. (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                {...register("estimatedAnnualRatePercent", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inflation">Inflação (%)</Label>
              <Input
                id="inflation"
                type="number"
                step="0.1"
                {...register("inflationPercent", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="growth">Cresc. aporte (%)</Label>
              <Input
                id="growth"
                type="number"
                step="0.1"
                {...register("contributionGrowthPercent", { valueAsNumber: true })}
              />
            </div>
          </div>
          {(errors.estimatedAnnualRatePercent ||
            errors.inflationPercent ||
            errors.contributionGrowthPercent) && (
            <p className="text-xs text-destructive">Valores inválidos.</p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={update.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="assumptions-form" disabled={update.isPending}>
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
