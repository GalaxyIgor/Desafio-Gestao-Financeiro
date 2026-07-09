import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeltaBadge, type Delta } from "@/components/delta-badge";
import { cn, interactiveCard } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  delta,
  icon,
  href,
}: {
  title: string;
  value: string;
  delta?: Delta;
  icon?: React.ReactNode;
  href?: string;
}) {
  const card = (
    <Card className={cn(href && interactiveCard)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {delta && <DeltaBadge delta={delta} />}
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
