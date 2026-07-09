"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useReports(range?: string) {
  return useQuery({
    queryKey: ["reports", range ?? "default"],
    queryFn: async () => {
      const { data, error } = await api.GET("/reports", {
        params: { query: range ? { range } : {} },
      });
      if (error) throw error;
      return data;
    },
  });
}
