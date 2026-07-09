"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Input monetário em reais (com prefixo R$).
 * Encaminha ref/props para funcionar com react-hook-form.
 * O valor é numérico em reais — converta para centavos no submit quando a API exigir.
 */
const MoneyInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        ref={ref}
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        className={cn("pl-9", className)}
        {...props}
      />
    </div>
  );
});
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
