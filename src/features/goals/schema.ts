import { z } from "zod";

export const priorities = ["high", "medium", "low"] as const;

export const priorityLabels: Record<(typeof priorities)[number], string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export const goalSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  description: z.string().optional(),
  priority: z.enum(priorities),
  icon: z.string().min(1, "Informe um ícone (emoji)"),
  color: z.string().min(1, "Informe uma cor"),
  targetReais: z.number({ message: "Valor inválido" }).min(0, "Valor inválido"),
  currentReais: z.number({ message: "Valor inválido" }).min(0, "Valor inválido"),
});
export type GoalValues = z.infer<typeof goalSchema>;

export const depositSchema = z.object({
  amountReais: z
    .number({ message: "Valor inválido" })
    .min(0.01, "Informe um valor"),
});
export type DepositValues = z.infer<typeof depositSchema>;
