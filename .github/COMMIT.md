# Commit Message Template

## Formato

```text
tipo(escopo): resumo em portugues ou ingles, max 72 chars
```

## Tipos aceitos

- `feat` - nova funcionalidade
- `fix` - correcao de bug
- `docs` - documentacao
- `refactor` - refatoracao sem mudanca de comportamento
- `chore` - tarefas de manutencao (deps, configs, scripts)
- `test` - adicao ou correcao de testes

## Exemplos

```text
feat(backend): add PostgreSQL event storage via Neon
fix(db): use make_interval instead of string concat in query
chore(scripts): add db:migrate script to package.json
```

## Estrutura do corpo (opcional)

```text
tipo(escopo): resumo curto

O que mudou e por que (nao repita o titulo):
- item

Escopo afetado:
- arquivo ou modulo

Testes:
- Testado: descricao
- Nao testado: motivo

Notas:
- informacao adicional
```
