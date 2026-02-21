export type RpaStatus = 'RUNNING' | 'COMPLETED' | 'ERROR' | 'IDLE' | 'WARNING' | 'QUEUED';

export interface RpaProcess {
  id: string;
  name: string;
  status: RpaStatus;
  company: string;
  machine: string;
  startTime: string;
  duration: string;
  records: number;
  totalRecords: number;
  description: string;
  lastUpdate: string;
  cpu: number;
  memory: number;
}

export interface EventLog {
  id: string;
  timestamp: string;
  processName: string;
  status: RpaStatus;
  message: string;
  details: string;
}

export const rpaProcesses: RpaProcess[] = [
  {
    id: 'RPA-001',
    name: 'NF_EMISSAO_LOTE',
    status: 'RUNNING',
    company: 'Tech Solutions LTDA',
    machine: 'SRV-RPA-01',
    startTime: '2026-02-21 08:30:12',
    duration: '02h 14m',
    records: 847,
    totalRecords: 1200,
    description: 'Emissao de notas fiscais em lote - SEFAZ',
    lastUpdate: '10:44:12',
    cpu: 34,
    memory: 62,
  },
  {
    id: 'RPA-002',
    name: 'CONCILIACAO_BANCARIA',
    status: 'RUNNING',
    company: 'Grupo Alpha S.A.',
    machine: 'SRV-RPA-02',
    startTime: '2026-02-21 09:00:00',
    duration: '01h 44m',
    records: 2341,
    totalRecords: 5000,
    description: 'Conciliacao automatica - Banco do Brasil',
    lastUpdate: '10:43:58',
    cpu: 45,
    memory: 71,
  },
  {
    id: 'RPA-003',
    name: 'FOLHA_PROCESSAMENTO',
    status: 'COMPLETED',
    company: 'Industria Beta LTDA',
    machine: 'SRV-RPA-01',
    startTime: '2026-02-21 06:00:00',
    duration: '03h 22m',
    records: 3450,
    totalRecords: 3450,
    description: 'Processamento de folha de pagamento - Fev/2026',
    lastUpdate: '09:22:00',
    cpu: 0,
    memory: 12,
  },
  {
    id: 'RPA-004',
    name: 'XML_DOWNLOAD_SEFAZ',
    status: 'ERROR',
    company: 'Comercio Delta ME',
    machine: 'SRV-RPA-03',
    startTime: '2026-02-21 07:45:00',
    duration: '00h 38m',
    records: 156,
    totalRecords: 890,
    description: 'Download XMLs NFe - Portal SEFAZ',
    lastUpdate: '08:23:00',
    cpu: 0,
    memory: 8,
  },
  {
    id: 'RPA-005',
    name: 'CERTIDAO_CONSULTA',
    status: 'WARNING',
    company: 'Servicos Gamma EIRELI',
    machine: 'SRV-RPA-02',
    startTime: '2026-02-21 09:30:00',
    duration: '01h 14m',
    records: 45,
    totalRecords: 120,
    description: 'Consulta certidoes negativas - RFB/PGFN',
    lastUpdate: '10:44:00',
    cpu: 18,
    memory: 34,
  },
  {
    id: 'RPA-006',
    name: 'OBRIGACAO_ACESSORIA',
    status: 'QUEUED',
    company: 'Logistica Epsilon LTDA',
    machine: 'SRV-RPA-04',
    startTime: '--:--:--',
    duration: '--:--',
    records: 0,
    totalRecords: 780,
    description: 'Envio SPED Fiscal - Competencia Jan/2026',
    lastUpdate: '10:30:00',
    cpu: 0,
    memory: 0,
  },
  {
    id: 'RPA-007',
    name: 'GUIA_PAGAMENTO',
    status: 'RUNNING',
    company: 'Construtora Zeta S.A.',
    machine: 'SRV-RPA-03',
    startTime: '2026-02-21 10:00:00',
    duration: '00h 44m',
    records: 89,
    totalRecords: 340,
    description: 'Geracao de guias DAS/DARF - Simples Nacional',
    lastUpdate: '10:44:05',
    cpu: 28,
    memory: 45,
  },
  {
    id: 'RPA-008',
    name: 'BACKUP_CONTABIL',
    status: 'IDLE',
    company: 'Todas as Empresas',
    machine: 'SRV-RPA-04',
    startTime: '--:--:--',
    duration: '--:--',
    records: 0,
    totalRecords: 0,
    description: 'Backup diario - Agendado 23:00',
    lastUpdate: '2026-02-20 23:45:00',
    cpu: 0,
    memory: 4,
  },
];

export const eventLogs: EventLog[] = [
  {
    id: 'EVT-001',
    timestamp: '10:44:12',
    processName: 'NF_EMISSAO_LOTE',
    status: 'RUNNING',
    message: 'Processando lote #47 - 18 notas emitidas',
    details: 'Lote 47/67 | Previsão: ~45min',
  },
  {
    id: 'EVT-002',
    timestamp: '10:44:05',
    processName: 'GUIA_PAGAMENTO',
    status: 'RUNNING',
    message: 'Guia DARF gerada - CNPJ ***456/0001-89',
    details: 'Ref: Jan/2026 | Valor: R$ 3.420,00',
  },
  {
    id: 'EVT-003',
    timestamp: '10:43:58',
    processName: 'CONCILIACAO_BANCARIA',
    status: 'RUNNING',
    message: 'Extrato processado - Conta 12345-6',
    details: '234 lancamentos conciliados automaticamente',
  },
  {
    id: 'EVT-004',
    timestamp: '10:44:00',
    processName: 'CERTIDAO_CONSULTA',
    status: 'WARNING',
    message: 'Timeout na consulta CND Federal',
    details: 'Tentativa 3/5 | Portal RFB instável',
  },
  {
    id: 'EVT-005',
    timestamp: '09:22:00',
    processName: 'FOLHA_PROCESSAMENTO',
    status: 'COMPLETED',
    message: 'Processo finalizado com sucesso',
    details: '3.450 registros | 0 erros | 12 alertas',
  },
  {
    id: 'EVT-006',
    timestamp: '08:23:00',
    processName: 'XML_DOWNLOAD_SEFAZ',
    status: 'ERROR',
    message: 'Certificado digital expirado - A1',
    details: 'Erro SSL | Certificado venceu em 19/02/2026',
  },
  {
    id: 'EVT-007',
    timestamp: '10:30:00',
    processName: 'OBRIGACAO_ACESSORIA',
    status: 'QUEUED',
    message: 'Aguardando slot de execucao',
    details: 'Posicao na fila: 1 | Prev: 11:00',
  },
  {
    id: 'EVT-008',
    timestamp: '10:42:30',
    processName: 'NF_EMISSAO_LOTE',
    status: 'RUNNING',
    message: 'Lote #46 concluido - 20 notas aprovadas SEFAZ',
    details: 'Aprovacao: 100% | Tempo medio: 2.3s/nota',
  },
  {
    id: 'EVT-009',
    timestamp: '10:40:15',
    processName: 'CONCILIACAO_BANCARIA',
    status: 'WARNING',
    message: '3 lancamentos sem correspondencia',
    details: 'Valores: R$ 150,00 | R$ 890,50 | R$ 2.100,00',
  },
  {
    id: 'EVT-010',
    timestamp: '10:38:00',
    processName: 'GUIA_PAGAMENTO',
    status: 'RUNNING',
    message: 'Iniciando geracao DAS - Simples Nacional',
    details: 'CNPJ ***789/0001-12 | Competencia: Jan/2026',
  },
];

export const statsOverview = {
  totalProcesses: 8,
  running: 3,
  completed: 1,
  errors: 1,
  warnings: 1,
  queued: 1,
  idle: 1,
  totalRecords: 6928,
  uptime: '99.7%',
};
