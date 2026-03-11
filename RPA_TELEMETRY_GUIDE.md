# RPA Telemetry Integration Guide

## Contexto

O servidor de monitoramento agora exige autenticacao para receber eventos.
Todo RPA que envia telemetria precisa incluir o header `X-Api-Key` com o token configurado no servidor.

Este documento descreve a arquitetura atual, o contrato de dados e o passo a passo para integrar ou atualizar cada RPA.

---

## Arquitetura

```
[ RPA ] --POST /events + X-Api-Key--> [ Servidor 192.168.1.3:8000 ] --> [ PostgreSQL Neon ]
                                                    |
                                    GET /api/status e /api/events
                                                    |
                                          [ Frontend Dashboard ]
```

**Endpoints:**

| Endpoint        | Metodo | Auth obrigatoria | Quem acessa         |
|-----------------|--------|------------------|---------------------|
| /events         | POST   | X-Api-Key        | RPAs                |
| /api/status     | GET    | Nao              | Frontend            |
| /api/events     | GET    | Nao              | Frontend            |
| /health         | GET    | Nao              | Health check        |

---

## Contrato de Dados

### Campos obrigatorios (POST /events)

```json
{
  "rpa": "nome-unico-do-rpa",
  "event": "rpa_started",
  "session_id": "identificador-unico-da-execucao",
  "machine": "nome-ou-ip-da-maquina",
  "empresa": "nome-da-empresa-sendo-processada",
  "timestamp": "2026-03-11T14:30:00Z"
}
```

### Campos opcionais

```json
{
  "status": "success",
  "duracao_segundos": 125,
  "records": 450,
  "totalRecords": 500,
  "description": "Descricao customizada do processamento",
  "cpu": 35.2,
  "memory": 512
}
```

### Tipos de evento aceitos

| event                | Status resultante | Quando usar                          |
|----------------------|-------------------|--------------------------------------|
| rpa_started          | RUNNING           | Inicio da execucao do RPA            |
| rpa_finished         | COMPLETED/WARNING | Fim da execucao (com ou sem alertas) |
| rpa_error            | ERROR             | Erro que interrompeu o RPA           |
| automation_started   | RUNNING           | Inicio de um ciclo de automacao      |
| automation_finished  | COMPLETED/WARNING | Fim de um ciclo de automacao         |

Para `rpa_finished` e `automation_finished`, o campo `status` define o resultado:
- `"success"` -> COMPLETED
- `"warning"` -> WARNING (ex: processou com divergencias)
- `"error"` -> ERROR

---

## Implementacao no telemetry.py

Cada RPA deve ter um `telemetry.py` (ou equivalente) com a seguinte estrutura base.

**IMPORTANTE: nao copiar e colar diretamente entre RPAs.**
Cada RPA tem um processo interno diferente. Use este template como ponto de partida
e adapte os pontos marcados com `# ADAPTAR`.

```python
import requests
import uuid
import socket
from datetime import datetime, timezone

# -- Configuracao ----------------------------------------------------------

SERVER_URL = "http://192.168.1.3:8000"
API_KEY    = "coloque-aqui-o-token-configurado-no-servidor"  # ADAPTAR: usar variavel de ambiente ou config file
RPA_NAME   = "nome-unico-deste-rpa"                          # ADAPTAR: nome identificador unico

# --------------------------------------------------------------------------


class RpaTelemetry:
    def __init__(self, empresa: str):
        self.rpa_name   = RPA_NAME
        self.empresa    = empresa           # ADAPTAR: de onde vem o nome da empresa?
        self.machine    = socket.gethostname()
        self.session_id = str(uuid.uuid4())
        self._headers   = {
            "Content-Type": "application/json",
            "X-Api-Key": API_KEY,
        }

    def send(self, event: str, **extra) -> None:
        """Envia um evento de telemetria. Falhas sao silenciosas (nao travam o RPA)."""
        payload = {
            "rpa":        self.rpa_name,
            "event":      event,
            "session_id": self.session_id,
            "machine":    self.machine,
            "empresa":    self.empresa,
            "timestamp":  datetime.now(timezone.utc).isoformat(),
            **extra,
        }
        try:
            response = requests.post(
                f"{SERVER_URL}/events",
                json=payload,
                headers=self._headers,
                timeout=5,
            )
            response.raise_for_status()
        except Exception as e:
            # Telemetria nunca deve travar o RPA
            print(f"[Telemetry] Falha ao enviar evento '{event}': {e}")


# -- Uso -------------------------------------------------------------------
#
# ADAPTAR: identifique onde no fluxo do RPA cada evento deve ser disparado.
# Nao existe um padrao unico — cada RPA tem seu proprio ciclo de vida.
#
# Exemplo generico:

def executar_rpa(empresa: str):
    t = RpaTelemetry(empresa=empresa)

    # 1. Inicio
    t.send("rpa_started")

    total = 0
    processados = 0
    try:
        # ADAPTAR: logica real do RPA aqui
        # registros = buscar_registros()
        # total = len(registros)
        # for r in registros:
        #     processar(r)
        #     processados += 1

        # 2. Conclusao com sucesso
        t.send(
            "rpa_finished",
            status="success",
            duracao_segundos=125,       # ADAPTAR: calcular tempo real
            records=processados,
            totalRecords=total,
            cpu=35.2,                   # ADAPTAR: monitorar ou omitir
            memory=512,                 # ADAPTAR: monitorar ou omitir
        )

    except Exception as e:
        # 3. Erro
        t.send(
            "rpa_error",
            status="error",
            description=str(e),
            records=processados,
            totalRecords=total,
        )
        raise
```

---

## Casos especiais

### RPA com status warning (ex: processou com divergencias)

```python
t.send(
    "rpa_finished",
    status="warning",
    records=processados,
    totalRecords=total,
    description=f"{divergencias} divergencias encontradas",
)
```

### RPA com multiplos ciclos de automacao por sessao

```python
# Inicio da sessao
t.send("rpa_started")

for empresa in lista_empresas:
    t.send("automation_started", empresa=empresa)  # Nota: empresa pode variar por ciclo
    # ... processar ...
    t.send("automation_finished", status="success", records=n)

# Fim da sessao
t.send("rpa_finished", status="success", duracao_segundos=total_segundos)
```

---

## Checklist por RPA

Para cada RPA, o responsavel deve estudar o codigo e responder:

- [ ] Qual e o `RPA_NAME` unico deste RPA?
- [ ] De onde vem o nome da `empresa` sendo processada?
- [ ] Onde no codigo acontece o inicio da execucao? (-> `rpa_started`)
- [ ] Onde acontece o fim com sucesso? (-> `rpa_finished` + `status="success"`)
- [ ] Existe cenario de warning (ex: divergencias)? (-> `status="warning"`)
- [ ] Onde sao capturados erros? (-> `rpa_error`)
- [ ] E possivel contar `records` e `totalRecords`? Se sim, de onde vem?
- [ ] Existe monitoramento de CPU/memoria? Se nao, omitir os campos.
- [ ] O RPA processa uma empresa por vez ou multiplas? (define se usa `automation_started/finished`)
- [ ] O `API_KEY` sera lido de variavel de ambiente, arquivo de config, ou hardcoded (nao recomendado)?

---

## Seguranca

- **Nao commitar o `API_KEY` no repositorio do RPA.**
- Usar variavel de ambiente ou arquivo de configuracao fora do controle de versao.
- O mesmo token do servidor deve ser distribuido para todos os RPAs com acesso seguro.

```python
import os
API_KEY = os.environ.get("RPA_API_KEY") or open("config/api_key.txt").read().strip()
```

---

## Validacao

Apos integrar, verificar no dashboard (`http://192.168.1.3:8000`) se:

1. O card do RPA aparece com o status correto
2. Os eventos aparecem no log de eventos
3. `records` e `totalRecords` estao sendo exibidos (se implementado)
4. O status `warning` renderiza corretamente (se aplicavel)

Ou via curl direto:

```bash
curl -X POST http://192.168.1.3:8000/events \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: SEU_TOKEN_AQUI" \
  -d '{
    "rpa": "teste-integracao",
    "event": "rpa_started",
    "session_id": "teste-001",
    "machine": "MINHA-MAQUINA",
    "empresa": "Empresa Teste",
    "timestamp": "2026-03-11T00:00:00Z"
  }'
```

Resposta esperada: `{"ok": true}`
Sem token ou token errado: `{"ok": false, "error": "Unauthorized"}`
