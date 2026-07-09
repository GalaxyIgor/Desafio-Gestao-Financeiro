import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn, interactiveCard } from "@/lib/utils";

interface BreakdownItem {
  label: string;
  amount: number;
  percent: number;
}

export function BreakdownCard({
  title,
  items,
  href,
}: {
  title: string;
  items: BreakdownItem[];
  href?: string;
}) {
  const card = (
    <Card
      className={cn("h-full", href && interactiveCard)}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Sem dados no período.</p>
        )}
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{item.label}</span>
              <span className="font-medium">{formatCurrency(item.amount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={item.percent} className="h-2" />
              <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                {formatPercent(item.percent, 0)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (!href) return card;
  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}
