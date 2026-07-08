/**
 * Acesso a variáveis de ambiente do SERVIDOR.
 * NUNCA importe este arquivo em componentes client — os valores (URL da API)
 * não devem chegar ao bundle do browser. Não usam prefixo NEXT_PUBLIC_.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Preencha o seu .env.local.`,
    );
  }
  return value;
}

export const env = {
  /** URL base da API externa, sem barra no final. */
  get apiBaseUrl(): string {
    return required("API_BASE_URL").replace(/\/+$/, "");
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
};
