# Planejamento: Implementação Branch shadcn/ui - RPA Monitor

## Contexto
Projeto RPA Monitor Dashboard com 43 componentes shadcn/ui não utilizados. Objetivo: experimentar uso da biblioteca em branch dedicada enquanto limpa a main.

## Fase 1: Setup e Limpeza

### 1.1 Verificar estado atual
```bash
git status
git branch -a
```
- Verificar branch atual e arquivos staged/modified
- Confirmar se está em estado limpo para branching

### 1.2 Criar branch experimental
```bash
git checkout -b feature/shadcn-ui-integration
git push -u origin feature/shadcn-ui-integration
```

### 1.3 Salvar estado atual da UI (backup)
```bash
cp -r src/app/components/ui src/app/components/ui-backup
git add src/app/components/ui-backup
git commit -m "backup: Save current shadcn/ui components before integration"
```

### 1.4 Voltar para main e limpar
```bash
git checkout main
```

**Limpeza na main:**
1. Remover pasta `src/app/components/ui/` inteira
2. Remover imports não utilizados nos arquivos:
   - Verificar se algum arquivo importa de `./ui/` ou `../ui/`
   - Não remover dependências do package.json ainda (manter pra branch)
3. Verificar se build funciona após remoção
4. Commit: `"cleanup: Remove unused shadcn/ui components"`

## Fase 2: Integração shadcn/ui (Branch dedicada)

### 2.1 Voltar para branch experimental
```bash
git checkout feature/shadcn-ui-integration
```

### 2.2 Componentes prioritários para integração
**Ordem de implementação:**

1. **Button** (`src/app/components/ui/button.tsx`)
   - Substituir botões customizados em: filtros, refresh, search
   - Manter variantes: outline, ghost para diferentes estados

2. **Badge** (`src/app/components/ui/badge.tsx`) 
   - Substituir `StatusBadge` atual
   - Usar variantes por status: destructive (error), secondary (idle), default (success)

3. **Card** (`src/app/components/ui/card.tsx`)
   - Refatorar `RpaCard` para usar Card, CardHeader, CardContent, CardTitle
   - Manter layout atual mas com componentes shadcn

4. **Input** (`src/app/components/ui/input.tsx`)
   - Substituir input de busca customizado
   - Manter ícone Search e estilização

5. **Table** (`src/app/components/ui/table.tsx`)
   - Refatorar `EventsTable` para Table, TableHead, TableBody, TableRow, TableCell
   - Manter funcionalidade de hover e responsividade

### 2.3 Arquivos a modificar

**2.3.1 Status Badge Integration**
- Arquivo: `src/app/components/status-badge.tsx`
- Substituir implementação customizada por `<Badge variant={...}>`
- Manter mapeamento de cores por status

**2.3.2 RPA Card Integration**  
- Arquivo: `src/app/components/rpa-card.tsx`
- Usar `<Card><CardHeader><CardTitle>` etc
- Manter grid de métricas e visual atual

**2.3.3 Events Table Integration**
- Arquivo: `src/app/components/events-table.tsx` 
- Substituir table HTML por componentes shadcn
- Manter funcionalidade de scroll e responsividade

**2.3.4 App.tsx Modifications**
- Substituir botões por `<Button variant="outline">`
- Substituir input por `<Input>` com forwardRef
- Manter lógica de estado e handlers

**2.3.5 Theme Integration**
- Arquivo: `src/styles/theme.css`
- Ajustar CSS custom properties para funcionar com shadcn
- Manter paleta terminal (verde, azul, vermelho, etc.)
- Configurar variáveis CSS para componentes shadcn

## Fase 3: Validação

### 3.1 Testes funcionais
- [ ] Filtros funcionam corretamente
- [ ] Busca funciona
- [ ] Cards exibem informações corretas  
- [ ] Tabela de eventos atualiza
- [ ] Responsividade mantida
- [ ] Performance não degradada

### 3.2 Comparação visual
- Capturar screenshots antes/depois
- Verificar se estética terminal se mantém
- Confirmar que não virou "generic business app"

### 3.3 Bundle analysis
```bash
npm run build
# Comparar tamanho do bundle vs versão main
```

## Decisão Final

**Se shadcn/ui melhorar o código:**
- Merge branch → main
- Remove dependências não usadas

**Se não compensar:**
- Manter main limpa 
- Archive branch
- Continuar com implementação customizada

## Comandos de Execução

**Para Claude Code executar:**
```bash
# Fase 1
git status && git checkout -b feature/shadcn-ui-integration
cp -r src/app/components/ui src/app/components/ui-backup
git add . && git commit -m "backup: Save shadcn/ui components"
git checkout main
rm -rf src/app/components/ui
# [verificar imports e remover referências]
git add . && git commit -m "cleanup: Remove unused shadcn/ui components"

# Fase 2  
git checkout feature/shadcn-ui-integration
# [implementar integrações por componente]

# Fase 3
npm run build && npm run typecheck
```

## Critérios de Sucesso
- Funcionalidade mantida 100%
- Código mais limpo e reutilizável
- Bundle size não aumenta significativamente  
- Estética terminal preservada
- Facilita manutenção futura

---
**Nota**: Se algum passo falhar ou houver dúvidas sobre implementação específica, parar e solicitar orientação.
