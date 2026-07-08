"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { AuthUser } from "./types";

export interface LoginInput {
  email: string;
  password: string;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.message ?? "Falha na requisição";
  } catch {
    return "Falha na requisição";
  }
}

/** Usuário autenticado (GET /api/auth/me). */
export function useMe() {
  return useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(await parseError(res));
      return res.json();
    },
  });
}

/** Login (POST /api/auth/login). */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await parseError(res));
      return (await res.json()) as { user: AuthUser };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data.user);
    },
    onSettled: () => {
      router.refresh();
    },
  });
}

/** Logout (POST /api/auth/logout). */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}
