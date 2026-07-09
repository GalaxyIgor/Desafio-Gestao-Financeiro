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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { assetSchema, type AssetValues } from "../schema";
import { useCreateAsset, useUpdateAsset } from "../api";

export interface Asset {
  id: string;
  name: string;
  assetClass: string;
  subtitle?: string;
  currentBalance: number;
  weightPercent: number;
  monthlyYield: { amount: number; percent: number };
  totalInvested?: number;
  averagePrice?: number;
}

const optionalNumber = (v: unknown) =>
  v === "" || v == null || Number.isNaN(Number(v)) ? undefined : Number(v);

export function AssetDialog({
  open,
  onOpenChange,
  asset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
}) {
  const create = useCreateAsset();
  const update = useUpdateAsset();
  const isEdit = Boolean(asset);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      assetClass: "",
      subtitle: "",
      currentBalance: 0,
      totalInvested: undefined,
      averagePrice: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      asset
        ? {
            name: asset.name,
            assetClass: asset.assetClass,
            subtitle: asset.subtitle ?? "",
            currentBalance: asset.currentBalance,
            totalInvested: asset.totalInvested,
            averagePrice: asset.averagePrice,
          }
        : {
            name: "",
            assetClass: "",
            subtitle: "",
            currentBalance: 0,
            totalInvested: undefined,
            averagePrice: undefined,
          },
    );
  }, [open, asset, reset]);

  function onSubmit(values: AssetValues) {
    const body = { ...values, subtitle: values.subtitle || undefined };
    const onError = (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");

    if (isEdit && asset) {
      update.mutate(
        { id: asset.id, ...body },
        {
          onSuccess: () => {
            toast.success("Ativo atualizado");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: () => {
          toast.success("Ativo criado");
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
          <DialogTitle>{isEdit ? "Editar ativo" : "Novo ativo"}</DialogTitle>
          <DialogDescription>Cadastre um ativo da carteira.</DialogDescription>
        </DialogHeader>

        <form id="asset-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Ex.: PETR4" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetClass">Classe</Label>
              <Input
                id="assetClass"
                placeholder="Ex.: Ações"
                {...register("assetClass")}
              />
              {errors.assetClass && (
                <p className="text-xs text-destructive">
                  {errors.assetClass.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
            <Input id="subtitle" {...register("subtitle")} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="balance">Saldo atual</Label>
              <MoneyInput
                id="balance"
                {...register("currentBalance", { valueAsNumber: true })}
              />
              {errors.currentBalance && (
                <p className="text-xs text-destructive">
                  {errors.currentBalance.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invested">Investido</Label>
              <MoneyInput
                id="invested"
                {...register("totalInvested", { setValueAs: optionalNumber })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avg">Preço médio</Label>
              <MoneyInput
                id="avg"
                {...register("averagePrice", { setValueAs: optionalNumber })}
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
          <Button type="submit" form="asset-form" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
