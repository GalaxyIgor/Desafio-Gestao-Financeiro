/**
 * Cliente de fetch SERVIDOR → API externa.
 * Injeta o Authorization: Bearer <token do cookie> por padrão.
 * Usado pelos route handlers do BFF (/api/auth/*, /api/bff/*).
 */
import { env } from "@/lib/env";
import { getSessionToken } from "@/lib/auth";

type ApiFetchInit = RequestInit & {
  /** Anexa o Bearer token do cookie (default: true). */
  auth?: boolean;
};

/**
 * Faz uma requisição à API externa.
 * @param path caminho iniciando com "/", ex. "/auth/login" ou "/overview?month=2026-07"
 */
export async function apiFetch(
  path: string,
  init: ApiFetchInit = {},
): Promise<Response> {
  const { auth = true, headers, ...rest } = init;
  const finalHeaders = new Headers(headers);

  if (auth) {
    const token = await getSessionToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: finalHeaders,
    cache: "no-store",
  });
}
