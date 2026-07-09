"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

/** Mês atual no formato YYYY-MM. */
export function currentMonth(): string {
  return format(new Date(), "yyyy-MM");
}

/** Navegação de mês (‹ Julho de 2026 ›). value/onChange no formato YYYY-MM. */
export function MonthNavigator({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const date = parse(`${value}-01`, "yyyy-MM-dd", new Date());
  const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
  const shift = (n: number) =>
    onChange(format(addMonths(date, n), "yyyy-MM"));

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Mês anterior"
        onClick={() => shift(-1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-36 text-center text-sm font-medium capitalize">
        {label}
      </span>
      <Button
        variant="outline"
        size="icon"
        aria-label="Próximo mês"
        onClick={() => shift(1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
