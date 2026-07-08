"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const KEY = ["expenses"];

export type ExpenseInput = {
  date: string;
  description: string;
  category: string;
  paymentMethod?: "credit" | "debit" | "pix" | "cash" | "boleto";
  amount: number;
};

/** Overview de despesas (GET /expenses/overview?month=YYYY-MM). */
export function useExpensesOverview(month?: string) {
  return useQuery({
    queryKey: [...KEY, "overview", month ?? "current"],
    queryFn: async () => {
      const { data, error } = await api.GET("/expenses/overview", {
        params: { query: month ? { month } : {} },
      });
      if (error) throw error;
      return data;
    },
  });
}

/** Lista completa de despesas (GET /expenses/entries). */
export function useExpenseEntries() {
  return useQuery({
    queryKey: [...KEY, "entries"],
    queryFn: async () => {
      const { data, error } = await api.GET("/expenses/entries");
      if (error) throw error;
      return data;
    },
  });
}

/** Limite mensal (GET /expenses/limit). */
export function useExpenseLimit() {
  return useQuery({
    queryKey: [...KEY, "limit"],
    queryFn: async () => {
      const { data, error } = await api.GET("/expenses/limit");
      if (error) throw error;
      return data;
    },
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ExpenseInput) => {
      const { data, error } = await api.POST("/expenses/entries", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<ExpenseInput> & { id: string }) => {
      const { data, error } = await api.PATCH("/expenses/entries/{id}", {
        params: { path: { id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/expenses/entries/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (limit: number) => {
      const { data, error } = await api.PUT("/expenses/limit", {
        body: { limit },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateAll(qc),
  });
}
