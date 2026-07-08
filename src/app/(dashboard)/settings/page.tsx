"use client";

import { LogOut } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useMe, useLogout } from "@/features/auth/api";

function initials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function SettingsPage() {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  return (
    <>
      <PageHeader
        title="Perfil"
        description="Seus dados e sessão"
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Informações do usuário autenticado</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="text-lg">
                  {initials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="font-medium">{user?.name ?? "Usuário"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          )}
        </CardContent>
        <Separator />
        <CardFooter className="justify-between gap-3 pt-6">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Encerrar sessão</p>
            <p className="text-xs text-muted-foreground">
              Você será desconectado e voltará à tela de login.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
