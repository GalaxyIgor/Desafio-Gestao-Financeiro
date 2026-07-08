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
import { limitSchema, type LimitValues } from "../schema";
import { useUpdateLimit } from "../api";

export function LimitDialog({
  open,
  onOpenChange,
  currentLimit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLimit: number;
}) {
  const update = useUpdateLimit();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LimitValues>({
    resolver: zodResolver(limitSchema),
    defaultValues: { limit: currentLimit },
  });

  useEffect(() => {
    if (open) reset({ limit: currentLimit });
  }, [open, currentLimit, reset]);

  function onSubmit(values: LimitValues) {
    update.mutate(Math.round(values.limit), {
      onSuccess: () => {
        toast.success("Limite atualizado");
        onOpenChange(false);
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Limite mensal</DialogTitle>
          <DialogDescription>
            Defina o teto de gastos para o mês.
          </DialogDescription>
        </DialogHeader>
        <form
          id="limit-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-2"
        >
          <Label htmlFor="limit">Valor do limite</Label>
          <MoneyInput
            id="limit"
            {...register("limit", { valueAsNumber: true })}
          />
          {errors.limit && (
            <p className="text-xs text-destructive">{errors.limit.message}</p>
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
          <Button type="submit" form="limit-form" disabled={update.isPending}>
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
