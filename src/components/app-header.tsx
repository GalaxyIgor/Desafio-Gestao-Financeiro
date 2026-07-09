"use client";

import Link from "next/link";
import { LogOut, TrendingDown, TrendingUp, UserRound } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMe, useLogout } from "@/features/auth/api";
import { useNetWorth } from "@/features/net-worth/api";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn, interactiveCard } from "@/lib/utils";

function NetWorthPill() {
  const { data, isLoading, isError } = useNetWorth();

  if (isLoading) return <Skeleton className="h-8 w-40" />;
  if (isError || !data) return null;

  const up = data.changePercent >= 0;
  return (
    <Link
      href="/reports"
      title="Ver relatórios"
      className={cn(
        "hidden items-center gap-2 rounded-lg border bg-card px-3 py-1.5 sm:flex",
        interactiveCard,
      )}
    >
      <span className="text-xs text-muted-foreground">Patrimônio</span>
      <span className="text-sm font-semibold">{formatCurrency(data.amount)}</span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-xs font-medium",
          up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
        )}
      >
        {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
        {formatPercent(Math.abs(data.changePercent))}
      </span>
    </Link>
  );
}

function initials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function AppHeader() {
  const { data: user } = useMe();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <div className="ml-auto flex items-center gap-2">
        <NetWorthPill />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full transition-transform hover:bg-transparent active:scale-90 motion-reduce:transform-none"
              />
            }
          >
            <Avatar className="size-8 ring-offset-2 ring-offset-background transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-primary/50 motion-reduce:transform-none">
              <AvatarFallback>{initials(user?.name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate">{user?.name ?? "Usuário"}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>
              <UserRound className="size-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
