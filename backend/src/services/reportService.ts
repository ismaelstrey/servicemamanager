import { reportRepository, ReportFilter, ReportsSummary } from '../repositories/reportRepository';

// Comentário: Serviço de relatórios centraliza regras de negócio e montagem de filtros

export const reportService = {
  // Comentário: Sumário com agregações básicas
  async getSummary(providerId: number, startDate?: string, endDate?: string): Promise<ReportsSummary> {
    return reportRepository.getSummary(providerId, startDate, endDate);
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