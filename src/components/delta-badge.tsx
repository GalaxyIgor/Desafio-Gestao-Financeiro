import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/lib/format";

export interface Delta {
  value: number;
  unit: "percent" | "pp" | "currency" | "brl" | string;
  direction: "up" | "down" | "neutral" | string;
  comparisonLabel?: string;
}

function formatDeltaValue(delta: Delta): string {
  switch (delta.unit) {
    case "currency":
    case "brl":
      return formatCurrency(delta.value);
    case "pp":
      return `${formatPercent(delta.value)} p.p.`;
    case "percent":
    default:
      return formatPercent(delta.value);
  }
}

/**
 * Badge de variação usado em cards de métricas.
 * Cor/seta a partir de `direction`; texto a partir de `unit`.
 */
export function DeltaBadge({
  delta,
  className,
  showLabel = true,
}: {
  delta: Delta;
  className?: string;
  showLabel?: boolean;
}) {
  const Icon =
    delta.direction === "up"
      ? ArrowUp
      : delta.direction === "down"
        ? ArrowDown
        : Minus;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
          delta.direction === "up" &&
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          delta.direction === "down" &&
            "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          delta.direction === "neutral" && "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-3" />
        {formatDeltaValue(delta)}
      </span>
      {showLabel && delta.comparisonLabel && (
        <span className="text-muted-foreground">{delta.comparisonLabel}</span>
      )}
    </span>
  );
}
