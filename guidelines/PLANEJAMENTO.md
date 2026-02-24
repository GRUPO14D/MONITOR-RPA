# PLANEJAMENTO - MONITOR-RPA

Este documento detalha o plano de acao para a evolucao tecnica do Monitor RPA, focando em CI/CD, Estabilidade da API, Transicao para Dados Reais e Acessibilidade.

---

## FASE 1: CI/CD e Infraestrutura (Vercel)

**Arquivo:** `.github/workflows/Pipiline-vercel.yml`

### 1.1 Branch trigger (linhas 7-9)

Trocar `branches-ignore: [main]` por `branches: [main]` para que o deploy ocorra **somente** na branch `main`.

### 1.2 Environment de producao (linha 24)

Trocar `--environment=preview` por `--environment=production`.

### 1.3 Deploy em producao (linhas 25-28)

Adicionar flag `--prod` ao build e `--prebuilt --prod` ao deploy:

```yaml
- name: Build
  run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
- name: Deploy to Production
  run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 1.4 Acoes manuais do usuario

- Renomear projeto no Dashboard Vercel para `MONITOR-RPA`
- Verificar que `VERCEL_PROJECT_ID` no GitHub Secrets esta correto
- Configurar Branch Protection na `main` (revisoes + status checks)

---

## FASE 2: API e Telemetria (Testes Manuais)

Sem alteracoes de codigo. O usuario deve testar manualmente:

- `GET /api/status` — deve retornar `{ rpas: [...], updated_at: "..." }`
- `GET /api/events?horas=24` — deve retornar `{ events: [...] }`
- `POST /api/events` — payload de teste:

```json
{
  "rpa": "TESTE_01",
  "event": "rpa_started",
  "session_id": "ABC-123",
  "machine": "VM-DEV-01",
  "empresa": "CLIENTE_X",
  "timestamp": "2024-03-20T10:00:00Z"
}
```

Se o contrato precisar evoluir, os arquivos relevantes sao:

- `api/rpa.ts` (serverless Vercel)
- `back-server/server.ts` (Fastify local)
- `src/app/services/api.ts` (mappers frontend)

---

## FASE 3: Frontend - Transicao para Dados Reais

### 3.1 Extrair tipos para arquivo dedicado

**Criar:** `src/app/types/rpa.ts`

Mover de `src/app/components/mock-data.ts` as definicoes:

- `RpaStatus` (union type)
- `RpaProcess` (interface, 17 propriedades)
- `EventLog` (interface, 6 propriedades)
- `StatsOverview` (interface, 9 propriedades)

### 3.2 Atualizar imports em 8 arquivos

| Arquivo | Import antigo | Import novo |
|:--------|:-------------|:------------|
| `src/app/App.tsx` | `from "./components/mock-data"` | `from "./types/rpa"` |
| `src/app/hooks/useRpaData.ts` | `from '../components/mock-data'` | `from '../types/rpa'` (somente types) |
| `src/app/components/dashboard-header.tsx` | `from './mock-data'` | `from '../types/rpa'` |
| `src/app/components/rpa-card.tsx` | `from './mock-data'` | `from '../types/rpa'` |
| `src/app/components/status-badge.tsx` | `from './mock-data'` | `from '../types/rpa'` |
| `src/app/components/stats-summary.tsx` | `from './mock-data'` | `from '../types/rpa'` |
| `src/app/components/events-table.tsx` | `from './mock-data'` | `from '../types/rpa'` |
| `src/app/services/api.ts` | `from '../components/mock-data'` | `from '../types/rpa'` |

### 3.3 Deletar `src/app/components/mock-data.ts`

### 3.4 Refatorar `useRpaData.ts`

- Remover imports de `mockProcesses` e `mockEvents`
- Estado inicial vazio: `useState<RpaProcess[]>([])` e `useState<EventLog[]>([])`
- Adicionar `isLoading: boolean` ao estado (inicia `true`, vira `false` apos primeiro fetch via `finally`)
- Retornar `isLoading` na interface `RpaData`

---

## FASE 4: Acessibilidade e Qualidade UI

### 4.1 Skeleton screens (`App.tsx`)

- Destruturar `isLoading` de `useRpaData()`
- Quando `isLoading === true`, renderizar skeletons no lugar de:
  - `StatsSummary` (4 cards skeleton)
  - Grid de `RpaCard` (4 cards skeleton)
  - `EventsTable` (linhas skeleton)
- Usar componente `Skeleton` existente em `src/app/components/ui/skeleton.tsx`

### 4.2 aria-live para mudancas de status

- Adicionar `aria-live="polite"` no grid de cards (linha 149 do `App.tsx`)

### 4.3 Keyboard navigation nos filtros

- Adicionar `role="toolbar"` e `aria-label="Filtros de status"` no wrapper dos pills (linha 116)
- Adicionar `aria-pressed={isActive}` em cada Button de filtro

---

## Arquivos criticos

| Arquivo | Acao |
|:--------|:-----|
| `.github/workflows/Pipiline-vercel.yml` | Editar (pipeline CI/CD) |
| `src/app/types/rpa.ts` | **Criar** (tipos extraidos) |
| `src/app/components/mock-data.ts` | **Deletar** (apos migracao) |
| `src/app/hooks/useRpaData.ts` | Editar (estado inicial + loading) |
| `src/app/App.tsx` | Editar (skeletons + acessibilidade) |
| `src/app/components/dashboard-header.tsx` | Editar (import) |
| `src/app/components/rpa-card.tsx` | Editar (import) |
| `src/app/components/status-badge.tsx` | Editar (import) |
| `src/app/components/stats-summary.tsx` | Editar (import) |
| `src/app/components/events-table.tsx` | Editar (import) |
| `src/app/services/api.ts` | Editar (import) |

---

## Verificacao

1. `npm run build` deve compilar sem erros apos todas as alteracoes
2. `npm run dev` deve exibir skeletons por breve momento e depois os dados (ou estado vazio se API offline)
3. Verificar que nenhum import de `mock-data` permanece: `grep -r "mock-data" src/`
4. Testar navegacao por teclado nos filtros (Tab + Enter/Space)
5. Verificar pipeline no GitHub Actions apos push na `main`
