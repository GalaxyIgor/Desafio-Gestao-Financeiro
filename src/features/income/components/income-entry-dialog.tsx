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
import { CategorySelect } from "@/features/categories/components/category-select";
import { incomeEntrySchema, type IncomeEntryValues } from "../schema";
import { useCreateIncomeEntry, useUpdateIncomeEntry } from "../api";

export interface IncomeEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  status: "received" | "pending";
  amount: number; // centavos
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function IncomeEntryDialog({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: IncomeEntry | null;
}) {
  const create = useCreateIncomeEntry();
  const update = useUpdateIncomeEntry();
  const isEdit = Boolean(entry);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IncomeEntryValues>({
    resolver: zodResolver(incomeEntrySchema),
    defaultValues: {
      date: todayISO(),
      description: "",
      category: "",
      status: "received",
      amountReais: 0,
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
            status: entry.status,
            amountReais: entry.amount,
          }
        : {
            date: todayISO(),
            description: "",
            category: "",
            status: "received",
            amountReais: 0,
          },
    );
  }, [open, entry, reset]);

  function onSubmit(values: IncomeEntryValues) {
    const payload = {
      date: values.date,
      description: values.description,
      category: values.category,
      status: values.status,
      amount: Math.round(values.amountReais),
    };
    const onError = (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");

    if (isEdit && entry) {
      update.mutate(
        { id: entry.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Receita atualizada");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success("Receita criada");
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
          <DialogTitle>{isEdit ? "Editar receita" : "Nova receita"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do lançamento."
              : "Adicione um novo lançamento de receita."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="income-form"
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
                {...register("amountReais", { valueAsNumber: true })}
              />
              {errors.amountReais && (
                <p className="text-xs text-destructive">
                  {errors.amountReais.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex.: Salário, Freelance..."
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
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <CategorySelect
                    id="category"
                    type="income"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Recebido</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
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
          <Button type="submit" form="income-form" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
