// Hook para acessar a API de Relatórios
// Sempre usar hooks para acesso à API, deixando componentes limpos e reutilizáveis.
// Comentários em português explicam o objetivo e uso.
import { ApiService } from '../services/api';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  tag?: string;
  assigneeId?: number;
  customerId?: number;
  priority?: string;
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
  priority?: string;
  assigneeId?: number;
  customerId?: number;
}

export interface ServiceOrderReportItem {
  id: number;
  status: string;
  scheduledAt: string;
  priority?: string;
  assigneeId?: number;
  customerId?: number;
}

async function getReportsSummary(filter: ReportFilter): Promise<ReportsSummary> {
  const res = await ApiService.get<ReportsSummary>('/reports/summary', { params: filter });
  return res.data;
}

async function getTicketsReport(filter: ReportFilter): Promise<TicketReportItem[]> {
  const res = await ApiService.get<TicketReportItem[]>('/reports/tickets', { params: filter });
  return res.data;
}

async function getServiceOrdersReport(filter: ReportFilter): Promise<ServiceOrderReportItem[]> {
  const res = await ApiService.get<ServiceOrderReportItem[]>('/reports/service-orders', { params: filter });
  return res.data;
}

async function exportReport(
  type: 'tickets' | 'serviceOrders',
  format: 'csv' | 'pdf' | 'xlsx',
  filter: ReportFilter
): Promise<void> {
  // Normaliza 'serviceOrders' para o formato esperado pelo backend: 'service_orders'
  const normalizedType = type === 'serviceOrders' ? 'service_orders' : type;
  await ApiService.get('/reports/export', { params: { ...filter, type: normalizedType, format } });
}

export function useReports() {
  return {
    getReportsSummary,
    getTicketsReport,
    getServiceOrdersReport,
    exportReport,
  };
}