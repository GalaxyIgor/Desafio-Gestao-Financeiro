import { z } from "zod";

export const paymentMethods = [
  "credit",
  "debit",
  "pix",
  "cash",
  "boleto",
] as const;

export const paymentMethodLabels: Record<(typeof paymentMethods)[number], string> =
  {
    credit: "Crédito",
    debit: "Débito",
    pix: "Pix",
    cash: "Dinheiro",
    boleto: "Boleto",
  };

/** Form de lançamento de despesa (valor já em reais — a API usa number). */
export const expenseEntrySchema = z.object({
  date: z.string().min(1, "Informe a data"),
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().min(1, "Informe a categoria"),
  paymentMethod: z.enum(paymentMethods),
  amount: z.number({ message: "Valor inválido" }).min(0, "Valor inválido"),
});

export type ExpenseEntryValues = z.infer<typeof expenseEntrySchema>;

export const limitSchema = z.object({
  limit: z.number({ message: "Valor inválido" }).min(0, "Valor inválido"),
});
export type LimitValues = z.infer<typeof limitSchema>;
