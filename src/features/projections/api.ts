"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const KEY = ["projections"];

export type AssumptionsInput = {
  plannedMonthlyContribution: number;
  estimatedAnnualRatePercent: number;
  inflationPercent: number;
  contributionGrowthPercent: number;
  returnsByClass: { assetClass: string; annualRatePercent: number }[];
};

export function useProjections(timeframe?: string) {
  return useQuery({
    queryKey: [...KEY, timeframe ?? "default"],
    queryFn: async () => {
      const { data, error } = await api.GET("/projections", {
        params: { query: timeframe ? { timeframe } : {} },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateAssumptions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AssumptionsInput) => {
      const { data, error } = await api.PUT("/projections/assumptions", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
