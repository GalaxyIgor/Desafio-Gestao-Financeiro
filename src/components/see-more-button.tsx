import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Botão "Ver mais" usado no topo de cards com gráfico. */
export function SeeMoreButton({ href }: { href: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      nativeButton={false}
      render={<Link href={href} />}
    >
      Ver mais
      <ChevronRight className="size-4" />
    </Button>
  );
}
