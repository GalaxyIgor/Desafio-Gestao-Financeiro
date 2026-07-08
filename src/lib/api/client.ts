/**
 * Cliente tipado do BROWSER.
 * Aponta para as rotas same-origin do BFF (/api/bff/*), NUNCA para a API externa.
 * O token JWT fica no cookie httpOnly injetado pelo servidor — o browser não o vê.
 */
import createClient from "openapi-fetch";
import type { paths } from "@/lib/api/schema";

export const api = createClient<paths>({
  baseUrl: "/api/bff",
});

/** Erro padronizado da API (shape statusCode/error/message da spec). */
export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown[];
}
