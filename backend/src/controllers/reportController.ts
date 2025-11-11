import { Response } from 'express';
import { reportService } from '../services/reportService';
import { exportReportSchema, reportFilterSchema } from '../validators/reportValidator';
import { AuthenticatedRequest } from '../types/api.types';

// Comentário: Controller de relatórios, expõe handlers de rotas e formata respostas

// Helper: resolver providerId do token (req.providerId) ou da query (?providerId=)
// Garante fallback quando req.providerId estiver 0/undefined/null
function resolveProviderId(req: AuthenticatedRequest): number | null {
  // Token primeiro, se válido (>0)
  // Comentário: Logs de debug temporários para investigar providerId vindo do token e da query
  console.log('[resolveProviderId] req.providerId =', req.providerId, 'typeof =', typeof req.providerId);
  console.log('[resolveProviderId] raw req.query =', req.query, 'providerId =', (req.query as any)?.providerId, 'typeof =', typeof (req.query as any)?.providerId);
  if (typeof req.providerId === 'number' && Number.isFinite(req.providerId) && req.providerId > 0) {
    return Number(req.providerId);
  }

  // Fallback: query string (?providerId=)
  const raw = (req.query as any)?.providerId;
  let fromQuery: number | undefined;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      if (Number.isFinite(n) && n > 0) fromQuery = n;
    }
  } else if (typeof raw === 'number') {
    if (Number.isFinite(raw) && raw > 0) fromQuery = Math.floor(raw);
  } else if (Array.isArray(raw)) {
    for (const item of raw) {
      const n = parseInt(String(item).trim(), 10);
      if (Number.isFinite(n) && n > 0) { fromQuery = n; break; }
    }
  }

  return fromQuery ?? null;
}

export const reportController = {
  // Comentário: Sumário de relatórios (KPIs)
  async getSummary(req: AuthenticatedRequest, res: Response) {


    // Permite providerId via token ou fallback por query para compatibilidade
    const providerId = resolveProviderId(req);
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    // Aceita filtros opcionais conforme roadmap (startDate, endDate, status, tag)
    const { startDate, endDate, status, tag } = reportFilterSchema.parse(req.query);
    const summary = await reportService.getSummary(providerId, { startDate, endDate, status, tag });
    return res.json(summary);
  },

  // Comentário: Relatório de tickets com paginação
  async getTickets(req: AuthenticatedRequest, res: Response) {
    console.log("Resposta da query", req)
    // Comentário: try/catch temporário para diagnosticar erro 400 na rota de tickets
    try {
      const providerId = resolveProviderId(req);
      console.log('[getTickets] providerId linha 61 =', providerId);
      if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

      const filter = reportFilterSchema.parse(req.query);
      console.log('[getTickets] providerId =', providerId, 'filter =', filter);
      const report = await reportService.getTicketsReport(providerId, filter);
      return res.json(report);
    } catch (error) {
      console.error('[getTickets] erro ao gerar relatório de tickets:', error);
      const status = (error as any)?.status && Number.isInteger((error as any).status) ? (error as any).status : 500;
      return res.status(status).json({ message: 'Falha ao obter relatório de tickets', error: (error as Error)?.message ?? 'Erro desconhecido' });
    }
  },

  // Comentário: Relatório de ordens de serviço com paginação
  async getServiceOrders(req: AuthenticatedRequest, res: Response) {

    const providerId = resolveProviderId(req);
    // console.log("Resposta da query", await req.query, providerId)

    // Log de debug enxuto (não vaza dados sensíveis)
    // console.debug('Report getServiceOrders query:', req.query, 'providerId:', providerId);
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const filter = reportFilterSchema.parse(req.query);
    const report = await reportService.getServiceOrdersReport(providerId, filter);
    return res.json(report);
  },

  // Comentário: Exportação de relatório em CSV/XLSX/PDF
  async exportReport(req: AuthenticatedRequest, res: Response) {
    const providerId = resolveProviderId(req);
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