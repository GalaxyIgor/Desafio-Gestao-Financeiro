/**
 * Gestão da sessão via cookie httpOnly (padrão BFF).
 * O JWT fica no cookie httpOnly — inacessível ao JavaScript do browser.
 * Importa next/headers, portanto só roda no servidor.
 */
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";

/** Lê o token JWT do cookie de sessão (undefined se não autenticado). */
export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

/** Grava o token no cookie httpOnly. maxAge derivado de expiresAt (ISO). */
export async function setSessionCookie(
  token: string,
  expiresAt?: string,
): Promise<void> {
  const store = await cookies();
  let maxAge: number | undefined;
  if (expiresAt) {
    const seconds = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    maxAge = seconds > 0 ? seconds : 0;
  }
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  });
}

/** Remove o cookie de sessão (logout / sessão expirada). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
