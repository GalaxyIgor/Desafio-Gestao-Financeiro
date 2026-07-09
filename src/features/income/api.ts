"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const KEY = ["income"];

export type IncomeEntryInput = {
  date: string;
  description: string;
  category: string;
  status?: "received" | "pending";
  amount?: number; // centavos
};

/** Receitas do mês (GET /income?month=YYYY-MM). */
export function useIncome(month?: string) {
  return useQuery({
    queryKey: [...KEY, month ?? "current"],
    queryFn: async () => {
      const { data, error } = await api.GET("/income", {
        params: { query: month ? { month } : {} },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateIncomeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: IncomeEntryInput) => {
      const { data, error } = await api.POST("/income/entries", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateIncomeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: Partial<IncomeEntryInput> & { id: string }) => {
      const { data, error } = await api.PATCH("/income/entries/{id}", {
        params: { path: { id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteIncomeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/income/entries/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
