"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  expenseEntrySchema,
  paymentMethodLabels,
  paymentMethods,
  type ExpenseEntryValues,
} from "../schema";
import { useCreateExpense, useUpdateExpense } from "../api";

export interface ExpenseEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  paymentMethod?: "credit" | "debit" | "pix" | "cash" | "boleto";
  amount: number;
  billingDate?: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function ExpenseEntryDialog({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: ExpenseEntry | null;
}) {
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const isEdit = Boolean(entry);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExpenseEntryValues>({
    resolver: zodResolver(expenseEntrySchema),
    defaultValues: {
      date: todayISO(),
      description: "",
      category: "",
      paymentMethod: "pix",
      amount: 0,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      entry
        ? {
            date: entry.date,
            description: entry.description,
            category: entry.category,
            paymentMethod: entry.paymentMethod ?? "pix",
            amount: entry.amount,
          }
        : {
            date: todayISO(),
            description: "",
            category: "",
            paymentMethod: "pix",
            amount: 0,
          },
    );
  }, [open, entry, reset]);

  function onSubmit(values: ExpenseEntryValues) {
    const onError = (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");

    if (isEdit && entry) {
      update.mutate(
        { id: entry.id, ...values },
        {
          onSuccess: () => {
            toast.success("Despesa atualizada");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(values, {
        onSuccess: () => {
          toast.success("Despesa criada");
          onOpenChange(false);
        },
        onError,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do lançamento."
              : "Adicione um novo lançamento de despesa."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="expense-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <MoneyInput
                id="amount"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex.: Mercado, Aluguel..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Ex.: Moradia"
                {...register("category")}
              />
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Pagamento</Label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m) => (
                        <SelectItem key={m} value={m}>
                          {paymentMethodLabels[m]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="expense-form" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
