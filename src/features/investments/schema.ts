import { z } from "zod";

export const assetSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  assetClass: z.string().min(1, "Informe a classe"),
  subtitle: z.string().optional(),
  currentBalance: z
    .number({ message: "Valor inválido" })
    .min(0, "Valor inválido"),
  totalInvested: z.number().min(0).optional(),
  averagePrice: z.number().min(0).optional(),
});

export type AssetValues = z.infer<typeof assetSchema>;
