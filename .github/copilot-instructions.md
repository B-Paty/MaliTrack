# Quick instructions for AI coding agents working on this repo

This file captures the essential, repo-specific knowledge an AI agent needs to be productive immediately.

1) Big picture
- Vite + React + TypeScript single-page app. Entry: `src/main.tsx` -> `src/App.tsx`.
- UI is composed from `src/assets/components/layout/*` (Header, Sidebar, ThemeProvider) and module pages in `src/assets/modules/*` (e.g. `JournalEntry.tsx`, `ChartOfAccounts.tsx`).
- Data flows: UI hooks in `src/hooks/*` call Supabase via `src/integrations/supabase/client.ts` and update local state/cache (React Query is installed: `@tanstack/react-query`).

2) Key integration points
- Supabase client: `src/integrations/supabase/client.ts` (uses an anon/publishable key). Do not add service_role keys to the repo.
- Migrations: SQL files live in `supabase/migrations/` and follow the timestamp_uuid.sql naming. RLS and functions are managed there (see existing triggers and SECURITY DEFINER functions).
- Storage: uploads use Supabase storage buckets; policies are created in migrations (`storage.objects` policies).

3) Developer workflows (explicit commands)
- Install: `npm i`
- Dev server: `npm run dev` (starts Vite)
- Build: `npm run build` (or `npm run build:dev` for dev-mode build)
- Preview the production build: `npm run preview`
- Lint: `npm run lint`

4) Project conventions and patterns to follow
- Tailwind utility merging: use `src/lib/utils.ts` `cn(...)` helper which wraps `clsx` + `tailwind-merge`.
- UI primitives are in `src/assets/ui/*` (shadcn-ui + Radix). Reuse these primitives for new controls.
- Hooks live under `src/hooks/` (e.g. `useTransactions.tsx`, `useAccounts.tsx`) — prefer adding new data logic as hooks there.
- Place domain pages in `src/assets/modules/` and route them via `src/pages/*`.
- SQL migrations: always add a new file under `supabase/migrations/` with a timestamp prefix. Keep destructive operations explicit and use `IF EXISTS` when removing policies.

5) Security & secrets guidance (repo-specific)
- `src/integrations/supabase/client.ts` contains the public (anon) key and project URL. Never commit a `service_role` key. Use environment variables or CI secrets.
- There is an MCP config at `.vscode/mcp.json` that runs a supabase MCP server; it expects `SUPABASE_ACCESS_TOKEN` as a prompt input. AI agents can use this pattern to run read-only migrations tools if provided with a token by a human operator.

6) Concrete examples
- Import supabase client: `import { supabase } from '@/integrations/supabase/client'` and then `await supabase.from('transactions').select('*')`.
- Add migration: create `supabase/migrations/YYYYMMDDHHMMSS_uuid.sql` and include only the minimal SQL (policies, ALTER TABLE, INSERT for seed data).

7) Missing/assumed items
- There are currently no automated tests in the repo. If adding tests, prefer lightweight unit tests around helpers and integration tests that run against a local Supabase emulator or a CI-provisioned project.

If anything here is unclear or you want more examples (e.g., a template migration file, or a sample data hook test), say which area and I will expand.
