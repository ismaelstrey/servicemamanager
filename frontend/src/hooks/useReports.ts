// Hook para acessar a API de Relatórios
// Sempre usar hooks para acesso à API, deixando componentes limpos e reutilizáveis.
// Comentários em português explicam o objetivo e uso.

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  tag?: string;
  assigneeId?: number;
  customerId?: number;
}

export interface Kpi {
  label: string;
  value: number;
}

export interface ReportsSummary {
  kpis: Kpi[];
}

export interface TicketReportItem {
  id: number;
  status: string;
  createdAt: string;
}

export interface ServiceOrderReportItem {
  id: number;
  status: string;
  scheduledAt: string;
}

const apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:4002';

// Constrói query strings tipadas, sem exigir index signature no tipo.
// Converte números/booleanos para string e ignora valores indefinidos ou string vazia.
function buildQueryString<T extends object>(params: T): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.length === 0) continue;
    searchParams.append(key, String(value));
  }
  return searchParams.toString();
}

async function getReportsSummary(filter: ReportFilter): Promise<ReportsSummary> {
  const qs = buildQueryString(filter);
  const res = await fetch(`${apiUrl}/api/reports/summary${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Falha ao carregar resumo de relatórios');
  return res.json();
}

async function getTicketsReport(filter: ReportFilter): Promise<TicketReportItem[]> {
  const qs = buildQueryString(filter);
  const res = await fetch(`${apiUrl}/api/reports/tickets${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Falha ao carregar relatório de tickets');
  return res.json();
}

async function getServiceOrdersReport(filter: ReportFilter): Promise<ServiceOrderReportItem[]> {
  const qs = buildQueryString(filter);
  const res = await fetch(`${apiUrl}/api/reports/service-orders${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Falha ao carregar relatório de OS');
  return res.json();
}

async function exportReport(
  type: 'tickets' | 'serviceOrders',
  format: 'csv' | 'pdf' | 'xlsx',
  filter: ReportFilter
): Promise<void> {
  const qs = buildQueryString({ ...filter, type, format });
  const res = await fetch(`${apiUrl}/api/reports/export?${qs}`);
  if (!res.ok) throw new Error('Falha na exportação de relatório');
}

export function useReports() {
  return {
    getReportsSummary,
    getTicketsReport,
    getServiceOrdersReport,
    exportReport,
  };
}