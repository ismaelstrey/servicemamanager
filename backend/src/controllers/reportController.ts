import { Response } from 'express';
import { reportService } from '../services/reportService';
import { exportReportSchema, reportFilterSchema } from '../validators/reportValidator';
import { AuthenticatedRequest } from '../types/api.types';

// Comentário: Controller de relatórios, expõe handlers de rotas e formata respostas

export const reportController = {
  // Comentário: Sumário de relatórios (KPIs)
  async getSummary(req: AuthenticatedRequest, res: Response) {
    const providerId = req.user?.providerId;
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const { startDate, endDate } = reportFilterSchema.partial().parse(req.query);
    const summary = await reportService.getSummary(providerId, startDate, endDate);
    return res.json(summary);
  },

  // Comentário: Relatório de tickets com paginação
  async getTickets(req: AuthenticatedRequest, res: Response) {
    const providerId = req.user?.providerId;
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const filter = reportFilterSchema.parse(req.query);
    const report = await reportService.getTicketsReport(providerId, filter);
    return res.json(report);
  },

  // Comentário: Relatório de ordens de serviço com paginação
  async getServiceOrders(req: AuthenticatedRequest, res: Response) {
    const providerId = req.user?.providerId;
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const filter = reportFilterSchema.parse(req.query);
    const report = await reportService.getServiceOrdersReport(providerId, filter);
    return res.json(report);
  },

  // Comentário: Exportação de relatório em CSV (MVP)
  async exportReport(req: AuthenticatedRequest, res: Response) {
    const providerId = req.user?.providerId;
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const params = exportReportSchema.parse(req.query);

    if (params.type === 'tickets') {
      const { items } = await reportService.getTicketsReport(providerId, {
        startDate: params.startDate,
        endDate: params.endDate,
        status: params.status,
      });
      const header = 'id,status,priority,createdAt\n';
      const lines = items.map(i => `${i.id},${i.status},${i.priority ?? ''},${i.createdAt.toISOString()}`);
      const csv = header + lines.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="tickets_report.csv"');
      return res.send(csv);
    }

    if (params.type === 'service_orders') {
      const { items } = await reportService.getServiceOrdersReport(providerId, {
        startDate: params.startDate,
        endDate: params.endDate,
        status: params.status,
      });
      const header = 'id,status,scheduledDate,createdAt\n';
      const lines = items.map(i => `${i.id},${i.status},${i.scheduledDate ? new Date(i.scheduledDate).toISOString() : ''},${i.createdAt.toISOString()}`);
      const csv = header + lines.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="service_orders_report.csv"');
      return res.send(csv);
    }

    return res.status(400).json({ message: 'Tipo de relatório não suportado' });
  },
};