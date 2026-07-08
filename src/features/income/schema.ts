import { z } from "zod";

/** Form de lançamento de receita (valor em reais no form → centavos na API). */
export const incomeEntrySchema = z.object({
  date: z.string().min(1, "Informe a data"),
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().min(1, "Informe a categoria"),
  status: z.enum(["received", "pending"]),
  amountReais: z
    .number({ message: "Valor inválido" })
    .min(0, "Valor inválido"),
});

export type IncomeEntryValues = z.infer<typeof incomeEntrySchema>;
