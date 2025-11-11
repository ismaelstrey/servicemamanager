"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const reportRepository_1 = require("../repositories/reportRepository");
// Comentário: Serviço de relatórios centraliza regras de negócio e montagem de filtros
exports.reportService = {
    // Comentário: Sumário com agregações básicas
    async getSummary(providerId, filter) {
        // Nota: 'tag' ainda não é suportado no schema do banco; aceitamos para compat.
        return reportRepository_1.reportRepository.getSummary(providerId, filter.startDate, filter.endDate, filter.status);
    },
    // Comentário: Tickets report
    async getTicketsReport(providerId, filter) {
        return reportRepository_1.reportRepository.getTicketsReport({ providerId, ...filter });
    },
    // Comentário: Service orders report
    async getServiceOrdersReport(providerId, filter) {
        return reportRepository_1.reportRepository.getServiceOrdersReport({ providerId, ...filter });
    },
};
