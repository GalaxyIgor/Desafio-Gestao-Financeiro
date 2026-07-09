import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Classes de um card clicável/interativo. No hover eleva-se (lift), ganha
 * sombra e destaque de borda; ao pressionar volta ao lugar. Anima suavemente e
 * respeita `prefers-reduced-motion` (desliga o movimento, mantém cor/sombra).
 */
export const interactiveCard =
  "cursor-pointer transition-all duration-200 ease-out will-change-transform " +
  "hover:-translate-y-1 hover:border-primary/40 hover:bg-muted/40 " +
  "hover:shadow-lg hover:shadow-primary/5 active:translate-y-0 active:shadow-md " +
  "motion-reduce:transform-none motion-reduce:transition-colors"
