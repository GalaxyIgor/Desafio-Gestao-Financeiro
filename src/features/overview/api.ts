"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

/** Visão geral / dashboard (GET /overview?month=YYYY-MM). */
export function useOverview(month?: string) {
  return useQuery({
    queryKey: ["overview", month ?? "current"],
    queryFn: async () => {
      const { data, error } = await api.GET("/overview", {
        params: { query: month ? { month } : {} },
      });
      if (error) throw error;
      return data;
    },
  });
}
