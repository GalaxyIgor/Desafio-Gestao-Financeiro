import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata valor monetário em BRL.
 * ATENÇÃO: a API mistura unidades — income/goals vêm em centavos (integer),
 * enquanto expenses/investments/overview vêm em reais (number).
 * Use { cents: true } nos domínios em centavos.
 */
export function formatCurrency(
  value: number,
  opts: { cents?: boolean; currency?: string } = {},
): string {
  const { cents = false, currency = "BRL" } = opts;
  const amount = cents ? value / 100 : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Formata percentual, ex. 12.5 -> "12,5%". */
export function formatPercent(value: number, digits = 1): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value) + "%";
}

/** Formata data (aceita ISO string ou Date). */
export function formatDate(date: string | Date, pattern = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: ptBR });
}

/** Compacta números grandes, ex. 1250000 -> "1,25 mi". */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
