# Desafio — Gestão Financeira

Frontend completo de **gestão financeira pessoal** construído sobre uma API REST externa (OpenAPI 3.0.3, JWT Bearer). O foco do desafio é **segurança**: o token JWT **nunca** é exposto ao JavaScript do browser — fica num cookie `httpOnly` e todo tráfego passa por um **BFF (Backend-For-Frontend)** same-origin.

## Stack

- **Next.js 16** (App Router, React Server Components) + **React 19**
- **TypeScript 5** — tipos da API gerados a partir do OpenAPI
- **Tailwind CSS v4** + **shadcn/ui** (Base UI)
- **TanStack Query v5** — cache, loading e mutations no client
- **openapi-fetch** + **openapi-typescript** — client HTTP tipado pela spec
- **react-hook-form** + **zod** — formulários e validação
- **Recharts** — gráficos
- **next-themes** — tema claro/escuro · **date-fns** — datas (pt-BR) · **sonner** — toasts

> ⚠️ Esta versão do Next.js tem breaking changes em relação a releases anteriores (ex.: `middleware.ts` foi renomeado para `proxy.ts`). Consulte `node_modules/next/dist/docs/` antes de alterar código de infraestrutura.

## Arquitetura de segurança (BFF)

O servidor Next é o intermediário entre o browser e a API externa. O browser **nunca** fala com a API diretamente:

```
Browser  →  Next route handler (lê cookie httpOnly)  →  API externa (Authorization: Bearer <token>)
```

- **Login** — [`src/app/api/auth/login/route.ts`](src/app/api/auth/login/route.ts): autentica na API, grava o `token` num cookie `httpOnly` / `Secure` (prod) / `SameSite=Lax` e devolve **apenas** o `user` ao client.
- **Proxy BFF** — [`src/app/api/bff/[...path]/route.ts`](src/app/api/bff/%5B...path%5D/route.ts): catch-all que repassa `GET/POST/PUT/PATCH/DELETE` para `${API_BASE_URL}/<path>` injetando o `Bearer` do cookie. Em `401` da API, limpa o cookie local.
- **Proteção de rotas** — [`src/proxy.ts`](src/proxy.ts): proteção otimista do grupo `(dashboard)` — sem cookie de sessão → redireciona para `/login`.
- **Sessão** — [`src/lib/auth.ts`](src/lib/auth.ts): leitura/escrita/limpeza do cookie `session` (só roda no servidor).
- **Env server-only** — [`src/lib/env.ts`](src/lib/env.ts): `API_BASE_URL` **sem** prefixo `NEXT_PUBLIC_`, portanto nunca chega ao bundle client.

**Por que BFF:** token em cookie `httpOnly` é inacessível ao JS → imune a roubo via XSS. O client continua usando TanStack Query contra rotas same-origin (`/api/bff/*`), preservando cache, estados de loading e optimistic updates. `SameSite=Lax` + same-origin cobre a maior parte do risco de CSRF.

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/login/            # tela de login
│   ├── (dashboard)/             # app shell + páginas por domínio
│   │   ├── page.tsx             # overview (rota raiz /)
│   │   ├── income/  expenses/  investments/  goals/
│   │   ├── reports/  projections/  categories/  users/  settings/
│   │   └── layout.tsx           # sidebar + header
│   └── api/
│       ├── auth/{login,logout,me}/route.ts
│       └── bff/[...path]/route.ts   # proxy BFF
├── features/<domínio>/          # api.ts (hooks Query) · schema.ts (zod) · components/
├── components/                  # UI compartilhada + shadcn/ui em components/ui/
├── lib/                         # api/ (client, schema gerado, server), auth, env, format, xlsx
└── proxy.ts                     # proteção de rotas (ex-middleware)
```

Cada domínio é auto-contido em `src/features/<domínio>/`: hooks de dados (`api.ts`), schema de validação (`schema.ts`) e componentes (tabelas CRUD, forms em dialog, charts).

## Domínios

`auth` · `overview` (dashboard) · `income` · `expenses` (+ limite mensal) · `investments` · `goals` (+ aportes) · `net-worth` · `reports` (+ export Excel) · `projections` (+ premissas) · `categories` · `users` · `settings`.

## Como rodar

Pré-requisitos: **Node.js 20+** e a URL de uma instância da API de finanças.

```bash
npm install
```

Crie um arquivo **`.env.local`** na raiz com a URL da API (variável server-only, sem `NEXT_PUBLIC_`):

```bash
# .env.local
API_BASE_URL=https://sua-api-de-financas.exemplo.com
```

Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e faça login com credenciais válidas da API.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (valida tipos contra a spec) |
| `npm run start` | Serve o build de produção |
| `npm run lint` | ESLint |
| `npm run gen:api` | Regera `src/lib/api/schema.d.ts` a partir de `docs/api-1.json` |

## Camada de dados e tipos

- `npm run gen:api` gera os tipos TypeScript **diretamente da spec** (`docs/api-1.json`) — nada de schema digitado à mão.
- [`src/lib/api/client.ts`](src/lib/api/client.ts) — client `openapi-fetch` tipado; no browser aponta para `/api/bff`.
- Hooks de dados por domínio em `src/features/<domínio>/api.ts` (ex.: `useOverview`, `useIncome`, `useCreateExpense`).
- Formulários com `react-hook-form` + `zod`, schemas espelhando os `requestBody` da spec.

> **Nota — unidade monetária inconsistente na API:** `income` e `goals` usam `amount` em centavos (`integer`), enquanto `expenses`/`investments`/`overview` usam reais (`number`). A conversão é centralizada em [`src/lib/format.ts`](src/lib/format.ts).

## Segurança — checklist de verificação

No DevTools, após o login:

- Cookie `session` marcado **`HttpOnly`** (e `Secure` em produção);
- **Nenhum** token em `localStorage` / `sessionStorage`;
- Nenhuma request do browser para a API externa — apenas same-origin `/api/bff/*`;
- `API_BASE_URL` ausente do bundle client;
- Cookie inválido/expirado (`401`) → redireciona para `/login`.
