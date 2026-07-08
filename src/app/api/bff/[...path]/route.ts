import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api/server";
import { clearSessionCookie, getSessionToken } from "@/lib/auth";

/**
 * Proxy BFF catch-all. Repassa /api/bff/<path> para a API externa injetando
 * o Bearer token do cookie httpOnly. O browser só fala com este endpoint
 * same-origin — nunca com a API externa diretamente.
 */
async function handle(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { path } = await ctx.params;
  const target =
    "/" + path.map(encodeURIComponent).join("/") + request.nextUrl.search;

  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";

  const res = await apiFetch(target, {
    method,
    headers: hasBody
      ? {
          "content-type":
            request.headers.get("content-type") ?? "application/json",
        }
      : undefined,
    body: hasBody ? await request.text() : undefined,
  });

  // Sessão expirada/inválida na API → limpa o cookie local.
  if (res.status === 401) await clearSessionCookie();

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = res.headers.get("content-type") ?? "";
  const responseBody = await res.arrayBuffer();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: contentType ? { "content-type": contentType } : undefined,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
