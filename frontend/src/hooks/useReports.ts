// Hook para acessar a API de Relatórios
// Sempre usar hooks para acesso à API, deixando componentes limpos e reutilizáveis.
// Comentários em português explicam o objetivo e uso.
import { ApiService } from '../services/api';
import { useAuth } from './useAuth';
import { useCallback, useMemo } from 'react';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  tag?: string;
  assigneeId?: number;
  customerId?: number;
  priority?: string;
  // providerId opcional: será resolvido automaticamente pelo hook
  providerId?: number;
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

export function useReports() {
  // Comentário: resolve o providerId a partir do contexto do usuário ou do localStorage
  const { user } = useAuth();
  const effectiveProviderId = useMemo(() => {
    const providerIdFromUser = user?.providerId;
    let providerIdFromLocal: number | undefined;
    try {
      const raw = localStorage.getItem('selectedProviderId');
      providerIdFromLocal = raw && raw !== 'global' ? Number(raw) : undefined;
    } catch {
      providerIdFromLocal = undefined;
    }
    return providerIdFromUser ?? providerIdFromLocal;
  }, [user?.providerId]);

  // Utilitário: mescla filtros incluindo providerId quando disponível
  const withProvider = useCallback((filter: ReportFilter): ReportFilter => ({
    ...filter,
    providerId: effectiveProviderId ?? filter.providerId,
  }), [effectiveProviderId]);

  const getReportsSummary = useCallback(async (filter: ReportFilter): Promise<ReportsSummary> => {
    const res = await ApiService.get<ReportsSummary>('/reports/summary', { params: withProvider(filter) });
    return res.data;
  }, [withProvider]);

  const getTicketsReport = useCallback(async (filter: ReportFilter): Promise<TicketReportItem[]> => {
    const res = await ApiService.get<TicketReportItem[]>('/reports/tickets', { params: withProvider(filter) });
    return res.data;
  }, [withProvider]);

  const getServiceOrdersReport = useCallback(async (filter: ReportFilter): Promise<ServiceOrderReportItem[]> => {
    const res = await ApiService.get<ServiceOrderReportItem[]>('/reports/service-orders', { params: withProvider(filter) });
    return res.data;
  }, [withProvider]);

  const exportReport = useCallback(async (
    type: 'tickets' | 'serviceOrders',
    format: 'csv' | 'pdf' | 'xlsx',
    filter: ReportFilter
  ): Promise<void> => {
    // Normaliza 'serviceOrders' para o formato esperado pelo backend: 'service_orders'
    const normalizedType = type === 'serviceOrders' ? 'service_orders' : type;
    await ApiService.get('/reports/export', { params: { ...withProvider(filter), type: normalizedType, format } });
  }, [withProvider]);

  return {
    getReportsSummary,
    getTicketsReport,
    getServiceOrdersReport,
    exportReport,
  };
}