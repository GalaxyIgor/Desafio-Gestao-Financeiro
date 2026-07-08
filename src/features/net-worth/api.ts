"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

/** Patrimônio líquido (GET /net-worth). */
export function useNetWorth() {
  return useQuery({
    queryKey: ["net-worth"],
    queryFn: async () => {
      const { data, error } = await api.GET("/net-worth");
      if (error) throw error;
      return data;
    },
  });
}
