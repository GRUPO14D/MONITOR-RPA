# Contrato de Dados — Telemetria dos RPAs

> Atualizado em: 2026-03-02
> Referência: refatoração de enriquecimento de telemetria aplicada nos 10 RPAs integrados.

---

## Contexto

O monitor-rpa exibe nos cards os campos `records`, `totalRecords`, `description`, `cpu` e `memory`.

Antes desta refatoração, os RPAs enviavam apenas `status`, `empresa` e `duracao_segundos`.
Agora cada execução também envia um objeto `detalhes` com os dados de negócio.

**Nenhuma alteração foi feita no backend (`telemetry.py`).**
O campo `detalhes` já existia e o backend persiste tudo que for passado nele.
O frontend lê via `detalhes.records`, `detalhes.totalRecords`, `detalhes.description`.

---

## Shape do objeto `detalhes`

```json
{
  "records":      <int>,
  "totalRecords": <int>,
  "description":  "<string>"
}
```

| Campo | Descrição |
|-------|-----------|
| `records` | Registros efetivamente processados / válidos nesta execução |
| `totalRecords` | Total de entrada — o universo que o RPA analisou |
| `description` | Frase legível descrevendo o que foi feito |

---

## Por RPA — semântica dos campos

| RPA | `records` | `totalRecords` | Exemplo de `description` |
|-----|-----------|----------------|--------------------------|
| **Cartorios** | cartórios processados | total selecionados | `"Integração contábil de 3 cartório(s) — mês 01-2025"` |
| **Conferencia NFs-e** | NFs conferidas (OK) | total de NFs | `"NFs-e: 142 OK, 8 divergentes"` |
| **SITTAX** | lançamentos conciliados | total Sittax | `"Sittax: 210 OK, 3 divergências"` |
| **REBNIC Importação** | notas para alterar | total REBNIC | `"REBNIC: 17 notas identificadas para alterar"` |
| **TROTS** | lançamentos no DataFrame | PDFs processados | `"Trots: 1840 lançamentos de 12 PDFs"` |
| **Drogaria** | notas com status OK | total conciliação | `"Drogaria DROMEDARIO: 95 OK, 4 divergências"` |
| **SISTEMA (SUPERPAO)** | arquivos convertidos | total de arquivos | `"SUPERPAO→Domínio: 7 arquivos convertidos para EMPRESA X"` |
| **REBNIC-ACUMULADOR** | lançamentos conciliados | total processado | `"REBNIC-Acumulador: 230 OK, 5 divergências"` |
| **TROTS ALT ENTRADA** | notas para corrigir | total no Domínio | `"Alt. Entrada: 12 notas para corrigir de 280 no Domínio"` |
| **VSX** | baixas válidas | total registros Itaú | `"VSX: 88 baixas válidas de 91 registros Itaú"` |

---

## Campo extra — REBNIC-ACUMULADOR

Este RPA envia um campo adicional que já existia antes da refatoração:

```json
{
  "records":      230,
  "totalRecords": 235,
  "description":  "REBNIC-Acumulador: 230 OK, 5 divergências",
  "divergencias": 5
}
```

---

## Status possíveis

| Status | Quem usa | Quando |
|--------|----------|--------|
| `"success"` | Todos os RPAs | Execução concluída sem erro |
| `"error"` | Todos os RPAs | Exceção ou falha durante execução |
| `"warning"` | **REBNIC-ACUMULADOR** (exclusivo) | Concluído, mas com divergências (`divergencias > 0`) |

> **Atenção:** O card do monitor-rpa precisa renderizar o status `"warning"` caso ainda não suporte.

---

## Comportamento em erro

Nos branches de erro, `records` e `totalRecords` podem ser `0` ou parciais,
dependendo de até onde o RPA chegou antes da falha.
`description` sempre descreve o contexto do erro.

```json
{
  "description": "Erro no cartório CARTORIO X (mês 01-2025)"
}
```

---

## CPU / Memory

Permanecem ausentes (`0` ou `null`). Nenhum RPA usa `psutil`.
O frontend já trata `0` como "sem dado" — nenhuma alteração necessária.

---

## Como o backend armazena

O `TELEMETRY.finish(..., detalhes: dict)` recebe o objeto livre e o persiste diretamente.
O frontend acessa via `evento.detalhes.records`, `evento.detalhes.totalRecords`, etc.

Estrutura completa do evento de telemetria:

```json
{
  "rpa_name":         "rebnic_acumulador",
  "status":           "warning",
  "empresa":          "REBNIC MADEIRAS",
  "duracao_segundos": 47,
  "detalhes": {
    "records":      230,
    "totalRecords": 235,
    "description":  "REBNIC-Acumulador: 230 OK, 5 divergências",
    "divergencias": 5
  }
}
```
