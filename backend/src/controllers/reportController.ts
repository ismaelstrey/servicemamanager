import { Response } from 'express';
import { reportService } from '../services/reportService';
import { exportReportSchema, reportFilterSchema } from '../validators/reportValidator';
import { AuthenticatedRequest } from '../types/api.types';

// Comentário: Controller de relatórios, expõe handlers de rotas e formata respostas

export const reportController = {
  // Comentário: Sumário de relatórios (KPIs)
  async getSummary(req: AuthenticatedRequest, res: Response) {
    // Permite providerId via token ou fallback por query para compatibilidade
    const providerId = req.providerId ?? (req.query && Number((req.query as any).providerId));
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    // Aceita filtros opcionais conforme roadmap (startDate, endDate, status, tag)
    const { startDate, endDate, status, tag } = reportFilterSchema.parse(req.query);
    const summary = await reportService.getSummary(providerId, { startDate, endDate, status, tag });
    return res.json(summary);
  },

  // Comentário: Relatório de tickets com paginação
  async getTickets(req: AuthenticatedRequest, res: Response) {
    const providerId = req.providerId ?? (req.query && Number((req.query as any).providerId));
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const filter = reportFilterSchema.parse(req.query);
    const report = await reportService.getTicketsReport(providerId, filter);
    return res.json(report);
  },

  // Comentário: Relatório de ordens de serviço com paginação
  async getServiceOrders(req: AuthenticatedRequest, res: Response) {
    const providerId = req.providerId ?? (req.query && Number((req.query as any).providerId));
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const filter = reportFilterSchema.parse(req.query);
    const report = await reportService.getServiceOrdersReport(providerId, filter);
    return res.json(report);
  },

  // Comentário: Exportação de relatório em CSV/XLSX/PDF
  async exportReport(req: AuthenticatedRequest, res: Response) {
    const providerId = req.providerId ?? (req.query && Number((req.query as any).providerId));
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const params = exportReportSchema.parse(req.query);
    
    // Helper para construir dataset e cabeçalhos por tipo
    const buildDataset = async () => {
      if (params.type === 'tickets') {
        const { items } = await reportService.getTicketsReport(providerId, {
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
        });
        const headers = ['id', 'status', 'priority', 'createdAt'];
        const rows = items.map(i => [
          i.id,
          i.status,
          i.priority ?? '',
          i.createdAt.toISOString(),
        ]);
        return { headers, rows, filenameBase: 'tickets_report' };
      }
      if (params.type === 'service_orders') {
        const { items } = await reportService.getServiceOrdersReport(providerId, {
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
          priority: params.priority,
          customerId: params.customerId,
        });
        const headers = ['id', 'status', 'priority', 'scheduledDate', 'createdAt', 'ticketId', 'customerName'];
        const rows = items.map(i => [
          i.id,
          i.status,
          i.priority ?? '',
          i.scheduledDate ? new Date(i.scheduledDate).toISOString() : '',
          i.createdAt.toISOString(),
          i.ticketId ?? '',
          i.customer?.name ?? '',
        ]);
        return { headers, rows, filenameBase: 'service_orders_report' };
      }
      return null;
    };

    const dataset = await buildDataset();
    if (!dataset) return res.status(400).json({ message: 'Tipo de relatório não suportado' });

    const { headers, rows, filenameBase } = dataset;

    // CSV (mantém compatibilidade)
    if (params.format === 'csv') {
      const headerLine = headers.join(',') + '\n';
      const lines = rows.map(r => r.map(v => `${v}`).join(','));
      const csv = headerLine + lines.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
      return res.send(csv);
    }

    // XLSX (Excel) via exceljs
    if (params.format === 'xlsx') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ExcelJS = require('exceljs');
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Report');
        ws.addRow(headers);
        rows.forEach(r => ws.addRow(r));
        const buffer = await wb.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
        return res.send(Buffer.from(buffer));
      } catch (err) {
        return res.status(500).json({ message: 'Falha ao gerar XLSX', error: (err as Error).message });
      }
    }

    // PDF via pdfkit
    if (params.format === 'pdf') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
          return res.send(pdfBuffer);
        });

        doc.fontSize(16).text('Relatório', { align: 'center' });
        doc.moveDown();
        // Cabeçalhos
        doc.fontSize(11).text(headers.join('  |  '));
        doc.moveDown(0.5);
        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        // Linhas
        rows.forEach(r => {
          doc.text(r.join('  |  '));
        });
        doc.end();
        return; // retorno será feito no evento 'end'
      } catch (err) {
        return res.status(500).json({ message: 'Falha ao gerar PDF', error: (err as Error).message });
      }
    }

    return res.status(400).json({ message: 'Formato de exportação não suportado' });
  },
};