"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { depositSchema, type DepositValues } from "../schema";
import { useDepositGoal } from "../api";
import type { Goal } from "./goal-dialog";

export function DepositDialog({
  open,
  onOpenChange,
  goal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}) {
  const deposit = useDepositGoal();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amountReais: 0 },
  });

  useEffect(() => {
    if (open) reset({ amountReais: 0 });
  }, [open, reset]);

  function onSubmit(values: DepositValues) {
    if (!goal) return;
    deposit.mutate(
      { id: goal.id, amount: Math.round(values.amountReais * 100) },
      {
        onSuccess: () => {
          toast.success("Aporte registrado");
          onOpenChange(false);
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo aporte</DialogTitle>
          <DialogDescription>
            {goal ? `Adicionar valor à meta "${goal.name}".` : ""}
          </DialogDescription>
        </DialogHeader>
        <form
          id="deposit-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-2"
        >
          <Label htmlFor="deposit">Valor do aporte</Label>
          <MoneyInput
            id="deposit"
            {...register("amountReais", { valueAsNumber: true })}
          />
          {errors.amountReais && (
            <p className="text-xs text-destructive">
              {errors.amountReais.message}
            </p>
          )}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deposit.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="deposit-form" disabled={deposit.isPending}>
            {deposit.isPending && <Loader2 className="size-4 animate-spin" />}
            Aportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
