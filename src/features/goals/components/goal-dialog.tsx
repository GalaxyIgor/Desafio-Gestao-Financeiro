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
  goalSchema,
  priorities,
  priorityLabels,
  type GoalValues,
} from "../schema";
import { useCreateGoal, useUpdateGoal } from "../api";

export interface Goal {
  id: string;
  name: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "active" | "completed";
  currentAmount: number;
  targetAmount: number;
  progressPercent: number;
  remaining: number;
  forecastDate: string;
  icon: string;
  color: string;
}

export function GoalDialog({
  open,
  onOpenChange,
  goal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
}) {
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const isEdit = Boolean(goal);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GoalValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "medium",
      icon: "🎯",
      color: "#6366f1",
      targetReais: 0,
      currentReais: 0,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      goal
        ? {
            name: goal.name,
            description: goal.description ?? "",
            priority: goal.priority,
            icon: goal.icon,
            color: goal.color,
            targetReais: goal.targetAmount / 100,
            currentReais: goal.currentAmount / 100,
          }
        : {
            name: "",
            description: "",
            priority: "medium",
            icon: "🎯",
            color: "#6366f1",
            targetReais: 0,
            currentReais: 0,
          },
    );
  }, [open, goal, reset]);

  function onSubmit(values: GoalValues) {
    const body = {
      name: values.name,
      description: values.description || undefined,
      priority: values.priority,
      icon: values.icon,
      color: values.color,
      targetAmount: Math.round(values.targetReais * 100),
      currentAmount: Math.round(values.currentReais * 100),
    };
    const onError = (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");

    if (isEdit && goal) {
      update.mutate(
        { id: goal.id, ...body },
        {
          onSuccess: () => {
            toast.success("Meta atualizada");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: () => {
          toast.success("Meta criada");
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
          <DialogTitle>{isEdit ? "Editar meta" : "Nova meta"}</DialogTitle>
          <DialogDescription>Defina um objetivo financeiro.</DialogDescription>
        </DialogHeader>

        <form id="goal-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid grid-cols-[4rem_1fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="icon">Ícone</Label>
              <Input id="icon" className="text-center" {...register("icon")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex.: Reserva de emergência"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input id="description" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="target">Valor alvo</Label>
              <MoneyInput
                id="target"
                {...register("targetReais", { valueAsNumber: true })}
              />
              {errors.targetReais && (
                <p className="text-xs text-destructive">
                  {errors.targetReais.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">Já guardado</Label>
              <MoneyInput
                id="current"
                {...register("currentReais", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {priorityLabels[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input id="color" placeholder="#6366f1" {...register("color")} />
              {errors.color && (
                <p className="text-xs text-destructive">{errors.color.message}</p>
              )}
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
          <Button type="submit" form="goal-form" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
