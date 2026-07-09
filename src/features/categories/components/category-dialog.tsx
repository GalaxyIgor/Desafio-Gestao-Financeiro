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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categorySchema,
  categoryTypeLabels,
  categoryTypes,
  type CategoryValues,
} from "../schema";
import { useCreateCategory, useUpdateCategory } from "../api";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "both";
  color?: string;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}) {
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const isEdit = Boolean(category);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", type: "expense", color: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      category
        ? { name: category.name, type: category.type, color: category.color ?? "" }
        : { name: "", type: "expense", color: "" },
    );
  }, [open, category, reset]);

  function onSubmit(values: CategoryValues) {
    const body = { ...values, color: values.color || undefined };
    const onError = (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");

    if (isEdit && category) {
      update.mutate(
        { id: category.id, ...body },
        {
          onSuccess: () => {
            toast.success("Categoria atualizada");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: () => {
          toast.success("Categoria criada");
          onOpenChange(false);
        },
        onError,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            Categorias organizam receitas e despesas.
          </DialogDescription>
        </DialogHeader>

        <form
          id="category-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Moradia" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {categoryTypeLabels[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor (opcional)</Label>
              <Input id="color" placeholder="Ex.: #22c55e" {...register("color")} />
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
          <Button type="submit" form="category-form" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
