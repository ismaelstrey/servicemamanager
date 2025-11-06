import { reportRepository, ReportFilter, ReportsSummary } from '../repositories/reportRepository';

// Comentário: Serviço de relatórios centraliza regras de negócio e montagem de filtros

export const reportService = {
  // Comentário: Sumário com agregações básicas
  async getSummary(providerId: number, filter: Pick<ReportFilter, 'startDate' | 'endDate' | 'status'> & { tag?: string }): Promise<ReportsSummary> {
    // Nota: 'tag' ainda não é suportado no schema do banco; aceitamos para compat.
    return reportRepository.getSummary(providerId, filter.startDate, filter.endDate, filter.status);
  },

  // Comentário: Tickets report
  async getTicketsReport(providerId: number, filter: Omit<ReportFilter, 'providerId'>) {
    return reportRepository.getTicketsReport({ providerId, ...filter });
  },

  // Comentário: Service orders report
  async getServiceOrdersReport(providerId: number, filter: Omit<ReportFilter, 'providerId'>) {
    return reportRepository.getServiceOrdersReport({ providerId, ...filter });
  },
};