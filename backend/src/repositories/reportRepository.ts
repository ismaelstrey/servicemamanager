import { prisma } from '../lib/prisma';

// Comentário: Repositório de relatórios agregando consultas para tickets e ordens de serviço
// Foco em filtros básicos: período e status. Demais filtros podem ser expandidos conforme evolução.


export type ReportFilter = {
  providerId: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  priority?: string;
  customerId?: number;
  page?: number;
  limit?: number;
};

export type TicketsReportItem = {
  id: number;
  status: string;
  priority?: string | null;
  createdAt: Date;
};

export type ServiceOrdersReportItem = {
  id: number;
  status: string;
  priority?: string | null;
  scheduledDate?: Date | null;
  createdAt: Date;
};

export type ReportsSummary = {
  totals: {
    tickets: number;
    openTickets: number;
    serviceOrders: number;
    pendingServiceOrders: number;
  };
  byStatus: {
    tickets: Record<string, number>;
    serviceOrders: Record<string, number>;
  };
  byPriority: {
    tickets: Record<string, number>;
    serviceOrders: Record<string, number>;
  };
  kpis?: Array<{ label: string; value: number }>;
};

function buildDateWhere(field: string, startDate?: string, endDate?: string) {
  const where: Record<string, any> = {};
  if (startDate || endDate) {
    where[field] = {};
    if (startDate) where[field].gte = new Date(startDate);
    if (endDate) where[field].lte = new Date(endDate);
  }
  return where;
}

export const reportRepository = {
  // Comentário: Sumário com agregações simples para KPIs
  async getSummary(providerId: number, startDate?: string, endDate?: string, status?: string): Promise<ReportsSummary> {
    const ticketDateWhere = buildDateWhere('createdAt', startDate, endDate);
    const soDateWhere = buildDateWhere('createdAt', startDate, endDate);

    const baseTicketWhere: any = { providerId, ...(status ? { status } : {}), ...ticketDateWhere };
    const baseSoWhere: any = { providerId, ...(status ? { status } : {}), ...soDateWhere };

    const [ticketsTotal, openTicketsTotal, serviceOrdersTotal, pendingServiceOrdersTotal] = await Promise.all([
      prisma.ticket.count({ where: baseTicketWhere }),
      prisma.ticket.count({ where: { providerId, status: { in: ['open', 'in_progress', 'waiting_client'] }, ...ticketDateWhere } }),
      prisma.serviceOrder.count({ where: baseSoWhere }),
      prisma.serviceOrder.count({ where: { providerId, status: { in: ['pending', 'in_progress', 'waiting_parts', 'waiting_client'] }, ...soDateWhere } }),
    ]);

    // Agrupamentos por status
    const [ticketsByStatus, serviceOrdersByStatus, ticketsByPriority, serviceOrdersByPriority] = await Promise.all([
      prisma.ticket.groupBy({ by: ['status'], where: baseTicketWhere, _count: { _all: true } }),
      prisma.serviceOrder.groupBy({ by: ['status'], where: baseSoWhere, _count: { _all: true } }),
      prisma.ticket.groupBy({ by: ['priority'], where: baseTicketWhere, _count: { _all: true } }),
      prisma.serviceOrder.groupBy({ by: ['priority'], where: baseSoWhere, _count: { _all: true } }),
    ]);

    return {
      totals: {
        tickets: ticketsTotal,
        openTickets: openTicketsTotal,
        serviceOrders: serviceOrdersTotal,
        pendingServiceOrders: pendingServiceOrdersTotal,
      },
      byStatus: {
        tickets: Object.fromEntries(ticketsByStatus.map((t: { status: string; _count: { _all: number } }) => [t.status, t._count._all])),
        serviceOrders: Object.fromEntries(serviceOrdersByStatus.map((s: { status: string; _count: { _all: number } }) => [s.status, s._count._all])),
      },
      byPriority: {
        tickets: Object.fromEntries(ticketsByPriority.map((t: { priority: string | null; _count: { _all: number } }) => [t.priority ?? 'unknown', t._count._all])),
        serviceOrders: Object.fromEntries(serviceOrdersByPriority.map((s: { priority: string | null; _count: { _all: number } }) => [s.priority ?? 'unknown', s._count._all])),
      },
      kpis: [
        { label: 'Tickets', value: ticketsTotal },
        { label: 'Tickets em aberto', value: openTicketsTotal },
        { label: 'Ordens de Serviço', value: serviceOrdersTotal },
        { label: 'OS pendentes', value: pendingServiceOrdersTotal },
      ],
    };
  },

  // Comentário: Lista de tickets para relatório com filtros básicos
  async getTicketsReport(filter: ReportFilter): Promise<{ items: TicketsReportItem[]; total: number; page: number; limit: number; }> {
    const { providerId, startDate, endDate, status, page = 1, limit = 20 } = filter;
    const where: any = { providerId, ...buildDateWhere('createdAt', startDate, endDate) };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        select: { id: true, status: true, priority: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where })
    ]);

    return { items, total, page, limit };
  },

  // Comentário: Lista de ordens de serviço para relatório com filtros básicos
  async getServiceOrdersReport(filter: ReportFilter): Promise<{ items: ServiceOrdersReportItem[]; total: number; page: number; limit: number; }> {
    const { providerId, startDate, endDate, status, priority, customerId, page = 1, limit = 20 } = filter;
    const where: any = { providerId, ...buildDateWhere('createdAt', startDate, endDate) };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (customerId) where.customerId = customerId;

    const [items, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        select: { id: true, status: true, priority: true, scheduledDate: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.serviceOrder.count({ where })
    ]);

    return { items, total, page, limit };
  },
};