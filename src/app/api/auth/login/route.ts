import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/server";
import { setSessionCookie } from "@/lib/auth";

interface LoginResponse {
  user: unknown;
  token: string;
  expiresAt?: string;
}

/** Login: repassa credenciais à API, grava o JWT no cookie httpOnly. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const res = await apiFetch("/auth/login", {
    method: "POST",
    auth: false,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text || null, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  }

  const data = (await res.json()) as LoginResponse;
  await setSessionCookie(data.token, data.expiresAt);
  // O token NÃO é retornado ao browser — só o usuário.
  return NextResponse.json({ user: data.user });
}
