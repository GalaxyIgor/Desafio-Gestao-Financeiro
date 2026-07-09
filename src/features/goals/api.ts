"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const KEY = ["goals"];

export type GoalInput = {
  name: string;
  description?: string;
  priority: "high" | "medium" | "low";
  icon: string;
  color: string;
  targetAmount: number; // centavos
  currentAmount: number; // centavos
};

export function useGoals() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await api.GET("/goals");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: GoalInput) => {
      const { data, error } = await api.POST("/goals", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<GoalInput> & { id: string }) => {
      const { data, error } = await api.PATCH("/goals/{id}", {
        params: { path: { id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/goals/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDepositGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data, error } = await api.POST("/goals/{id}/deposit", {
        params: { path: { id } },
        body: { amount },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
