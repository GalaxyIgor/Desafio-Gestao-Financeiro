import { z } from "zod";

export const categoryTypes = ["income", "expense", "both"] as const;

export const categoryTypeLabels: Record<(typeof categoryTypes)[number], string> =
  {
    income: "Receita",
    expense: "Despesa",
    both: "Ambos",
  };

export const categorySchema = z.object({
  name: z.string().min(1, "Informe o nome").max(100),
  type: z.enum(categoryTypes),
  color: z.string().max(20).optional(),
});

export type CategoryValues = z.infer<typeof categorySchema>;
