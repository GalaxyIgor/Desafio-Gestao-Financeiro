"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const KEY = ["categories"];

export type CategoryType = "income" | "expense" | "both";

export type CategoryInput = {
  name: string;
  type?: CategoryType;
  color?: string;
};

/** Lista categorias (GET /categories?type=). */
export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: [...KEY, type ?? "all"],
    queryFn: async () => {
      const { data, error } = await api.GET("/categories", {
        params: { query: type ? { type } : {} },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CategoryInput) => {
      const { data, error } = await api.POST("/categories", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<CategoryInput> & { id: string }) => {
      const { data, error } = await api.PATCH("/categories/{id}", {
        params: { path: { id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/categories/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
