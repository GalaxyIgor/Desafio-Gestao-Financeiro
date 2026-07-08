import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/server";
import { clearSessionCookie, getSessionToken } from "@/lib/auth";

/** Retorna o usuário autenticado a partir do cookie de sessão. */
export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const res = await apiFetch("/auth/me");
  if (!res.ok) {
    if (res.status === 401) await clearSessionCookie();
    return new NextResponse(await res.text(), { status: res.status });
  }

  return NextResponse.json(await res.json());
}
