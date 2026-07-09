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
import { useCreateUser, useUpdateUser } from "../api";

export interface User {
  id: string;
  email: string;
  name: string;
}

const schema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres").max(255),
  email: z.string().email("E-mail inválido"),
});
type Values = z.infer<typeof schema>;

export function UserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}) {
  const create = useCreateUser();
  const update = useUpdateUser();
  const isEdit = Boolean(user);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset(user ? { name: user.name, email: user.email } : { name: "", email: "" });
  }, [open, user, reset]);

  function onSubmit(values: Values) {
    const onError = (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");

    if (isEdit && user) {
      update.mutate(
        { id: user.id, name: values.name },
        {
          onSuccess: () => {
            toast.success("Usuário atualizado");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(
        { email: values.email, name: values.name },
        {
          onSuccess: () => {
            toast.success("Usuário criado");
            onOpenChange(false);
          },
          onError,
        },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "O e-mail não pode ser alterado."
              : "Cadastre um novo usuário."}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              disabled={isEdit}
              {...register("email")}
            />
            {errors.email && !isEdit && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
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
          <Button type="submit" form="user-form" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
