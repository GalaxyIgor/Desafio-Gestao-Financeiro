"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const KEY = ["investments"];

export type AssetInput = {
  name: string;
  assetClass: string;
  subtitle?: string;
  currentBalance: number;
  totalInvested?: number;
  averagePrice?: number;
};

export function useInvestments(range?: string) {
  return useQuery({
    queryKey: [...KEY, range ?? "default"],
    queryFn: async () => {
      const { data, error } = await api.GET("/investments", {
        params: { query: range ? { range } : {} },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AssetInput) => {
      const { data, error } = await api.POST("/investments/assets", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<AssetInput> & { id: string }) => {
      const { data, error } = await api.PATCH("/investments/assets/{id}", {
        params: { path: { id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/investments/assets/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
