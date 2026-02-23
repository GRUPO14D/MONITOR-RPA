# PLANEJAMENTO - MONITOR-RPA

Este documento detalha o plano de ação para a evolução técnica do Monitor RPA, focando em CI/CD, Estabilidade da API e Transição para Dados Reais.

---

## 🚀 FASE 1: CI/CD e Infraestrutura (Vercel)

### 1.1 Configuração de Produção
*   **Ação:** Alterar o pipeline do GitHub Actions para disparar deploys apenas na branch `main`.
*   **Arquivo:** `.github/workflows/Pipiline-vercel.yml`
*   **Mudança:** Substituir `branches-ignore: [main]` por `branches: [main]`.
*   **Segurança:** Configurar o repositório no GitHub para "Branch Protection" na `main`, exigindo revisões e aprovação de status checks antes do merge.

### 1.2 Renomeação do Projeto
*   **Ação:** Alterar o nome do projeto na Vercel de `rpa-monitor-design-dashboard` para `MONITOR-RPA`.
*   **Arquivo:** `vercel.json` (Já atualizado localmente, mas requer sincronização no Dashboard da Vercel).
*   **Impacto:** Atualizar as variáveis de ambiente `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` nos segredos do GitHub para refletir o novo projeto.

---

## 📡 FASE 2: API e Telemetria (Testes e Evolução)

### 2.1 Validação Técnica (Amanhã)
*   **Testes Manuais:** Realizar chamadas `GET` e `POST` (PUT não é utilizado no contrato atual) para `/api/status` e `/api/events`.
*   **Ferramenta:** Utilizar Postman ou `curl` para simular o payload do RPA:
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

### 2.2 Evolução do Contrato de Dados
*   **Análise de Getters:** Observar se os RPAs precisam enviar métricas adicionais (ex: uso de disco, latência de rede) em pontos estratégicos do fluxo de automação.
*   **Ajuste no Backend:** Se novos campos forem necessários, atualizar as interfaces `TelemetryEvent` e `RPAStatus` em `api/rpa.ts` e `back-server/server.ts`.

---

## 💻 FASE 3: Frontend - Transição para Dados Reais

### 3.1 Limpeza de Mock Data
*   **Refatoração de Tipos:** Criar `src/app/types/rpa.ts` para abrigar as interfaces `RpaProcess`, `EventLog` e `RpaStatus`, removendo-as de `mock-data.ts`.
*   **Remoção de Imports:** Localizar e remover todos os imports de `mockData` nos componentes (8 arquivos identificados).

### 3.2 Ajuste do Hook `useRpaData`
*   **Estado Inicial:** Alterar o estado inicial de `processes` e `events` para arrays vazios `[]`.
*   **Fluxo de Sync:** Garantir que a flag `isLive` reflita corretamente o status da conexão com a API real.
*   **Fallback Seguro:** Manter uma lógica de erro amigável caso a API esteja inacessível.

---

## ♿ FASE 4: Acessibilidade e Qualidade UI

### 4.1 Estratégia de Acessibilidade
*   **Anúncios Dinâmicos:** Usar `aria-live` para anunciar quando um RPA muda de status (ex: de "IDLE" para "RUNNING").
*   **Skeleton Screens:** Implementar estados de carregamento (Skeletons) enquanto os dados reais estão sendo buscados pela primeira vez, evitando saltos de layout (CLS).
*   **Teclado:** Garantir que as Pills de filtro sejam navegáveis via Tab e ativáveis via Space/Enter.

---

## 📅 Cronograma de Execução

| Atividade | Responsável | Status | Prazo |
| :--- | :--- | :--- | :--- |
| Configuração CI/CD (Somente Main) | AI Agent | Pendente | Hoje |
| Renomeação de Projeto Vercel | AI Agent / User | Pendente | Hoje |
| Refatoração de Tipos e Mock Removal | AI Agent | Pendente | Hoje |
| Testes de API (GET/POST) | AI Agent / User | Pendente | Amanhã |
| Teste dos 7 RPAs Modificados | User | Pendente | Amanhã |
| Homologação Final Produção | User | Pendente | Amanhã |

---
*Documento gerado automaticamente pelo Gemini CLI - Foco em estabilidade e automação.*
