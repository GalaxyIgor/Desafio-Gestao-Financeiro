# Plano — Frontend de Gestão Financeira (Desafio)

## Context

O repositório `Desafio-Gestao-Financeiro` recebeu um scaffold limpo de **Next.js 16 (App Router) + Tailwind v4 + shadcn/ui** (`style: base-nova`, RSC ativo). Foi entregue a documentação de uma **API REST completa de finanças pessoais** (OpenAPI 3.0.3, `api-1.json`) com 11 domínios e autenticação **JWT Bearer**. O objetivo é construir o **frontend completo** que consome essa API, com **segurança como prioridade** (token JWT nunca exposto ao JavaScript do browser).

Decisões já alinhadas com o usuário:
- **Backend já existe** e roda numa URL (será configurada por env, server-only).
- **Escopo: app completo** (todos os 11 domínios).
- **Data layer: padrão BFF + TanStack Query** (recomendado por segurança — ver abaixo).
- **Gráficos: Recharts via shadcn charts.**

## Domínios da API (de `api-1.json`)

`auth` (login/logout/me) · `overview` (dashboard) · `income` · `expenses` (+limit) · `investments` · `goals` (+deposit) · `net-worth` · `reports` · `projections` (+assumptions) · `settings` (profile/security/preferences/notifications/card) · `categories` · `users`.

Todos os endpoints exigem `bearerAuth` (JWT), exceto liveness `/health` e `/ready`.

---

## Arquitetura de segurança (o núcleo do desafio)

**Padrão BFF (Backend-For-Frontend):** o servidor Next é intermediário entre browser e API externa.

```
Browser → Next route handler (lê cookie httpOnly) → API externa (Authorization: Bearer)
```

1. **Login** (`POST /api/auth/login`, route handler no Next):
   - Chama `${API_BASE_URL}/auth/login` com email/senha.
   - Recebe `{ user, token, expiresAt }`.
   - Grava o `token` num cookie **`httpOnly`, `Secure` (prod), `SameSite=Lax`, `Path=/`**, com `maxAge` derivado de `expiresAt`.
   - Retorna só o `user` ao client (token nunca vai pro browser).
2. **Proxy BFF** — catch-all `src/app/api/bff/[...path]/route.ts`:
   - Repassa GET/POST/PATCH/PUT/DELETE para `${API_BASE_URL}/<path>` injetando `Authorization: Bearer <cookie>`.
   - Encaminha query string e body; devolve status/JSON da API.
   - Em `401` da API → limpa cookie e sinaliza sessão expirada.
3. **`middleware.ts`** — protege o route group `(dashboard)`: sem cookie de sessão → redirect para `/login`. Rotas de auth ficam no group `(auth)`.
4. **Env server-only:** `API_BASE_URL` (sem prefixo `NEXT_PUBLIC_`) → URL e token nunca chegam ao bundle client. `.env.example` documenta.
5. **Logout** (`POST /api/auth/logout`): chama API e apaga o cookie.
6. **Segredos e bloqueio de acesso:**
   - `.env.local` gerado com **placeholders comentados** (`API_BASE_URL=` vazio) — o usuário preenche os valores reais; a IA nunca vê segredos. Arquivo já ignorado pelo `.gitignore` do scaffold.
   - `.env.example` versionado documenta as variáveis sem valores.
   - `.claude/settings.json` recebe regras `permissions.deny` de leitura para `Read(./.env)`, `Read(./.env.local)`, `Read(./.env.*)`, `Read(**/.env*)` — barra a ferramenta Read de acessar arquivos de ambiente. Não autorizar comandos de shell (`cat`/`Get-Content`) sobre `.env`.

**Por que BFF vence:** token em cookie `httpOnly` é inacessível ao JS → imune a roubo por XSS; ainda assim o client usa TanStack Query batendo em rotas same-origin (`/api/bff/*`), preservando cache, loading e optimistic updates. `SameSite=Lax` + same-origin cobre a maior parte do risco de CSRF.

---

## Camada de dados e tipos

- **`openapi-typescript`** gera `src/lib/api/schema.d.ts` a partir de `api-1.json` → tipos idênticos à spec (sem digitar schema à mão).
- **`openapi-fetch`** como client tipado; no browser aponta para `/api/bff`, no servidor pode apontar direto para `API_BASE_URL`.
- **TanStack Query** (`QueryClientProvider` num client component em `src/app/providers.tsx`): hooks por domínio em `src/features/<domain>/api.ts` (ex.: `useOverview`, `useIncome`, `useCreateExpense`).
- **Forms:** `react-hook-form` + `zod` (`@hookform/resolvers`), schemas em `src/features/<domain>/schema.ts` espelhando os `requestBody` da spec (min/max já vêm da doc).

**⚠️ Nota de implementação — unidade monetária inconsistente na API:** `income` e `goals` usam `amount: integer` (centavos), enquanto `expenses`, `investments` e `overview` usam `number` (reais). Centralizar em `src/lib/format.ts` um `formatCurrency(value, { cents?: boolean })` e aplicar por domínio. Datas via `date-fns` com locale pt-BR.

---

## Estrutura de UI

- **App shell:** sidebar de navegação (shadcn `sidebar`), header com `net-worth` + menu de usuário + toggle de tema (`next-themes`, refletindo `settings.preferences.theme`).
- **Route groups:**
  - `src/app/(auth)/login/page.tsx`
  - `src/app/(dashboard)/layout.tsx` (shell) + páginas: `overview` (rota raiz `/`), `income`, `expenses`, `investments`, `goals`, `reports`, `projections`, `settings`, `categories`, `users`.
- **Componentes por feature** em `src/features/<domain>/components/` (tabelas CRUD, cards de métrica, forms em dialog/sheet, charts).
- **Componente `DeltaBadge`** reutilizável: vários endpoints retornam `delta: { value, unit, direction }` — um só componente renderiza seta ↑/↓ + cor + label.

### Mapa de telas (resumo)
- **Overview `/`:** cards de métricas (income/expenses/balance/savingsRate com delta), gráfico de fluxo mensal (linhas income/expenses/balance), despesas por categoria (donut), receita por fonte, progresso de metas, resumo de investimento, quick stats.
- **Income:** cards summary, tabela de lançamentos (CRUD via `/income/entries`), histórico (chart), fontes.
- **Expenses:** overview + limite mensal editável (`/expenses/limit`), tabela CRUD (`/expenses/entries`), breakdown por categoria; suporta `recurringMonths`/`installments` no form.
- **Investments:** summary, alocação (donut), evolução (linha), tabela de ativos CRUD (`/investments/assets`).
- **Goals:** cards de progresso, CRUD + aporte (`/goals/{id}/deposit`).
- **Reports:** filtros (range/from/to/accounts/categories), income vs expense (chart), KPIs, categorias, tabela mensal.
- **Projections:** summary, cenários (multi-linha), form de premissas (`PUT /projections/assumptions`), composição no horizonte.
- **Settings:** abas profile / security (2FA, troca de senha) / preferences (tema, moeda) / notifications / cartão.
- **Categories:** CRUD com filtro por tipo.
- **Users:** tabela CRUD paginada (`page`/`limit`).

---

## Componentes shadcn a adicionar

`card input label table dialog sheet dropdown-menu form select tabs badge sonner skeleton switch chart avatar separator sidebar progress tooltip` (button e utils já existem).

---

## Passos de implementação (ordem sugerida)

0. **Blindagem de segredos (primeiro):** adicionar regras `permissions.deny` de leitura de `.env*` no `.claude/settings.json`; criar `.env.local` (placeholders) e `.env.example`.
1. **Base:** limpar `page.tsx`/`globals.css` do boilerplate; ajustar `metadata`; instalar deps (`@tanstack/react-query`, `openapi-fetch`, `openapi-typescript` (dev), `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`, `next-themes`, `recharts`); adicionar componentes shadcn.
2. **Tipos:** gerar `src/lib/api/schema.d.ts` a partir de `api-1.json` (script `npm run gen:api`).
3. **Segurança/BFF:** route handlers `login`/`logout`/`me`, proxy `bff/[...path]`, helper `apiFetch` server-side, `middleware.ts`, `.env.example`.
4. **Providers:** TanStack Query + theme; client `openapi-fetch` apontando pro BFF.
5. **App shell:** sidebar + header + net-worth + user menu.
6. **Login** ponta a ponta contra a API real.
7. **Features** na ordem: overview → income → expenses → goals → investments → categories → reports → projections → settings → users.
8. **Utilitários transversais:** `formatCurrency`/datas, `DeltaBadge`, estados de loading (skeleton) e erro/toast.

## Arquivos-chave a criar/alterar

- `src/app/layout.tsx`, `src/app/providers.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(dashboard)/layout.tsx` + páginas por domínio.
- `src/app/api/auth/{login,logout,me}/route.ts`, `src/app/api/bff/[...path]/route.ts`.
- `middleware.ts`, `.env.example`, `.env.local` (não commitado).
- `src/lib/api/{schema.d.ts,client.ts}`, `src/lib/{format.ts,auth.ts}`.
- `src/features/<domain>/{api.ts,schema.ts,components/*}`.
- `src/components/ui/*` (shadcn), `src/components/delta-badge.tsx`, `src/components/app-sidebar.tsx`.

---

## Verificação (end-to-end)

- `npm run dev` e testar **login contra a API real** com credenciais válidas.
- **Confirmar segurança:** no DevTools, cookie `session` marcado `HttpOnly`/`Secure`; `localStorage`/`sessionStorage` **sem** token; nenhuma request do browser para a API externa (só same-origin `/api/bff/*`); `API_BASE_URL` ausente do bundle client.
- Navegar por todas as telas; validar cards, gráficos e tabelas com dados reais.
- Exercitar **CRUD** (criar/editar/excluir) em income, expenses, goals, investments, categories, users e ver o cache do Query atualizar.
- Forçar **expiração/401** (cookie inválido) → redireciona para `/login`.
- `npm run build` sem erros de tipo (garante que os tipos gerados batem com o uso).
