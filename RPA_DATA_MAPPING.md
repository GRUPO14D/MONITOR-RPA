# RPA Data Mapping Study — Frontend Integration

## Overview
O frontend espera dados estruturados em `RpaProcess`. Cada RPA deve enviar telemetria em um formato específico (`BackendRPAStatus`) que será mapeado para o frontend.

---

## Frontend Expected Data Structure

### RpaProcess (Frontend Display Model)
```typescript
interface RpaProcess {
  id: string;              // Auto-generated: RPA-001, RPA-002...
  name: string;            // Nome do RPA (ex: "RPA-Consulta-Clientes")
  status: RpaStatus;       // RUNNING | COMPLETED | ERROR | IDLE | WARNING | QUEUED
  company: string;         // Empresa sendo processada
  machine: string;         // Máquina que executa
  startTime: string;       // ISO timestamp
  duration: string;        // Formatado: "02h 15m"
  records: number;         // Registros já processados
  totalRecords: number;    // Total de registros a processar
  description: string;     // Descrição do processo
  lastUpdate: string;      // HH:mm:ss PT-BR
  cpu: number;             // Percentual de CPU (0-100)
  memory: number;          // MB de memória
}
```

---

## Backend Data Format (What RPAs Send)

### TelemetryEvent (RPA → Backend)
```typescript
interface TelemetryEvent {
  rpa: string;                    // ✓ REQUIRED: Nome único do RPA (ex: "RPA-Consulta-Clientes")
  event: string;                  // ✓ REQUIRED: rpa_started | rpa_finished | rpa_error | automation_started | automation_finished
  session_id: string;             // ✓ REQUIRED: ID único da execução
  machine: string;                // ✓ REQUIRED: Nome/IP da máquina executora
  empresa: string;                // ✓ REQUIRED: Empresa/cliente sendo processado
  timestamp: string;              // ✓ REQUIRED: ISO 8601 (ex: "2026-02-28T14:30:00Z")

  // Optional fields
  status?: string;                // success | error (sobrescreve mapeamento de event)
  duracao_segundos?: number;      // Tempo total em segundos

  // Extra fields (armazenados em detalhes)
  records?: number;               // Registros processados nesta execução
  totalRecords?: number;          // Total de registros para processar
  description?: string;           // Descrição customizada do processamento
  cpu?: number;                   // % de CPU utilizado
  memory?: number;                // MB de memória utilizado
  [key: string]: any;            // Outros campos customizados
}
```

### RPAStatus (Backend In-Memory State)
```typescript
interface RPAStatus {
  rpa: string;
  status: string;                 // running | success | error | automating | unknown
  event: string;
  empresa: string;
  machine: string;
  timestamp: string;
  session_id: string;
  duracao_segundos?: number;
  detalhes: {                     // Todos os campos extra do TelemetryEvent
    records?: number;
    totalRecords?: number;
    description?: string;
    cpu?: number;
    memory?: number;
    [key: string]: any;
  }
}
```

---

## Mapping Logic (Backend → Frontend)

### Status Mapping
```
Backend Status    → Frontend Status
"running"         → RUNNING
"automating"      → RUNNING
"success"         → COMPLETED
"error"           → ERROR
"unknown"         → IDLE
(any other)       → IDLE
```

### Event-based Status (from event field)
```
Event Type              → Frontend Status
"rpa_started"          → RUNNING
"automation_started"   → RUNNING
"rpa_finished"         → COMPLETED (or custom status if status field set)
"automation_finished"  → COMPLETED (or custom status if status field set)
"rpa_error"            → ERROR
(other events)         → IDLE
```

### Data Transformation
| Frontend Field | Source | Transformation |
|---|---|---|
| `id` | Auto-generated | `RPA-${index+1}` (padStart 3) |
| `name` | `rpa` | Direct |
| `status` | `status` + `event` | Via STATUS_MAP |
| `company` | `empresa` | Direct or 'N/A' |
| `machine` | `machine` | Direct or 'N/A' |
| `startTime` | `timestamp` | Direct ISO string |
| `duration` | `duracao_segundos` | Format: `02h 15m` (or '--:--' if missing) |
| `records` | `detalhes.records` | Direct (0 if missing) |
| `totalRecords` | `detalhes.totalRecords` | Direct (0 if missing) |
| `description` | `detalhes.description` \| `event` | Falls back to event name |
| `lastUpdate` | `timestamp` | Format to PT-BR HH:mm:ss |
| `cpu` | `detalhes.cpu` | Direct percentage (0 if missing) |
| `memory` | `detalhes.memory` | Direct MB (0 if missing) |

---

## 7 RPAs Integration Checklist

**⚠️ IMPORTANT: Each RPA has a different internal process and structure. Do NOT simply copy-paste the same telemetry code to all RPAs.**

Each RPA audit must:
1. **Identify unique processing steps** (e.g., what triggers `rpa_started`? What marks completion?)
2. **Map custom fields** (some RPAs may have `records` at the end, others during processing)
3. **Determine timestamp strategy** (use system time or custom event time?)
4. **Decide on granularity** (send per-batch or per-total completion?)

### RPA 1: `[NAME_TO_BE_DETERMINED]`
**Status**: ⚪ Not studied yet
- **Process Type**: ?
- **Records Tracking**: ?
- **Event Pattern**: ?
- **Custom Fields Needed**: ?
- **Notes**:

---

### RPA 2: `[NAME_TO_BE_DETERMINED]`
**Status**: ⚪ Not studied yet
- **Process Type**: ?
- **Records Tracking**: ?
- **Event Pattern**: ?
- **Custom Fields Needed**: ?
- **Notes**:

---

### RPA 3: `[NAME_TO_BE_DETERMINED]`
**Status**: ⚪ Not studied yet
- **Process Type**: ?
- **Records Tracking**: ?
- **Event Pattern**: ?
- **Custom Fields Needed**: ?
- **Notes**:

---

### RPA 4: `[NAME_TO_BE_DETERMINED]`
**Status**: ⚪ Not studied yet
- **Process Type**: ?
- **Records Tracking**: ?
- **Event Pattern**: ?
- **Custom Fields Needed**: ?
- **Notes**:

---

### RPA 5: `[NAME_TO_BE_DETERMINED]`
**Status**: ⚪ Not studied yet
- **Process Type**: ?
- **Records Tracking**: ?
- **Event Pattern**: ?
- **Custom Fields Needed**: ?
- **Notes**:

---

### RPA 6: `[NAME_TO_BE_DETERMINED]`
**Status**: ⚪ Not studied yet
- **Process Type**: ?
- **Records Tracking**: ?
- **Event Pattern**: ?
- **Custom Fields Needed**: ?
- **Notes**:

---

### RPA 7: `[NAME_TO_BE_DETERMINED]`
**Status**: ⚪ Not studied yet
- **Process Type**: ?
- **Records Tracking**: ?
- **Event Pattern**: ?
- **Custom Fields Needed**: ?
- **Notes**:

---

## Generic Telemetry Template

Every RPA should send events following this pattern:

```python
# Example telemetry.py integration (generic)
import requests
from datetime import datetime

BACKEND_URL = "https://monitor-rpa-production.up.railway.app"  # or local

class RpaTelemetry:
    def __init__(self, rpa_name, machine, empresa):
        self.rpa_name = rpa_name
        self.machine = machine
        self.empresa = empresa
        self.session_id = f"{rpa_name}-{datetime.now().timestamp()}"

    def send_event(self, event_type, **extra_fields):
        """
        Send telemetry event.

        Args:
            event_type: 'rpa_started' | 'rpa_finished' | 'rpa_error' | ...
            **extra_fields: records, totalRecords, cpu, memory, description, etc.
        """
        payload = {
            "rpa": self.rpa_name,
            "event": event_type,
            "session_id": self.session_id,
            "machine": self.machine,
            "empresa": self.empresa,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            **extra_fields
        }

        try:
            response = requests.post(f"{BACKEND_URL}/events", json=payload)
            response.raise_for_status()
        except Exception as e:
            print(f"Telemetry error: {e}")

# Usage (varies per RPA!)
telemetry = RpaTelemetry("RPA-Consulta-Clientes", "MACHINE-001", "Empresa A")

# Start
telemetry.send_event("rpa_started")

# Processing...
# (Track progress, monitor CPU/memory)

# End (success)
telemetry.send_event(
    "rpa_finished",
    status="success",
    duracao_segundos=125,
    records=450,
    totalRecords=500,
    cpu=35.2,
    memory=512
)

# Or error
# telemetry.send_event("rpa_error", status="error", description="DB connection failed")
```

---

## Implementation Strategy

### Phase 1: Study (IN PROGRESS)
- [ ] Identify all 7 RPAs and their names
- [ ] Document each RPA's internal process
- [ ] Define event flow per RPA
- [ ] Identify where to inject telemetry

### Phase 2: Pilot (Next)
- [ ] Integrate telemetry into 2-3 pilot RPAs
- [ ] Validate data arrives correctly in backend
- [ ] Monitor memory/CPU overhead
- [ ] Validate frontend display

### Phase 3: Scale (After validation)
- [ ] Integrate remaining 4-5 RPAs
- [ ] Fine-tune per-RPA event granularity
- [ ] Add monitoring/alerting rules

---

## Key Takeaways

✅ **Frontend needs standardized data structure** (RpaProcess)
✅ **Backend accepts flexible telemetry** (extra fields in detalhes)
✅ **Each RPA integration is unique** (process logic differs)
✅ **Use generic telemetry template** as starting point, **adapt per RPA**
✅ **Status mapping is automatic** (no frontend changes needed if data format correct)
