import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/server";
import { clearSessionCookie } from "@/lib/auth";

/** Logout: notifica a API (best-effort) e remove o cookie de sessão. */
export async function POST() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignora falha da API — o importante é limpar o cookie local
  }
  await clearSessionCookie();
  return new NextResponse(null, { status: 204 });
}
