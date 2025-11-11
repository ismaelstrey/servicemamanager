"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRepository = void 0;
const prisma_1 = require("../lib/prisma");
function buildDateWhere(field, startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
        where[field] = {};
        if (startDate)
            where[field].gte = new Date(startDate);
        if (endDate)
            where[field].lte = new Date(endDate);
    }
    return where;
}
exports.reportRepository = {
    // Comentário: Sumário com agregações simples para KPIs
    async getSummary(providerId, startDate, endDate, status) {
        const ticketDateWhere = buildDateWhere('createdAt', startDate, endDate);
        const soDateWhere = buildDateWhere('createdAt', startDate, endDate);
        const baseTicketWhere = { providerId, ...(status ? { status } : {}), ...ticketDateWhere };
        const baseSoWhere = { providerId, ...(status ? { status } : {}), ...soDateWhere };
        const [ticketsTotal, openTicketsTotal, serviceOrdersTotal, pendingServiceOrdersTotal] = await Promise.all([
            prisma_1.prisma.ticket.count({ where: baseTicketWhere }),
            prisma_1.prisma.ticket.count({ where: { providerId, status: { in: ['open', 'in_progress', 'waiting_client'] }, ...ticketDateWhere } }),
            prisma_1.prisma.serviceOrder.count({ where: baseSoWhere }),
            prisma_1.prisma.serviceOrder.count({ where: { providerId, status: { in: ['pending', 'in_progress', 'waiting_parts', 'waiting_client'] }, ...soDateWhere } }),
        ]);
        // Agrupamentos por status
        const [ticketsByStatus, serviceOrdersByStatus, ticketsByPriority, serviceOrdersByPriority] = await Promise.all([
            prisma_1.prisma.ticket.groupBy({ by: ['status'], where: baseTicketWhere, _count: { _all: true } }),
            prisma_1.prisma.serviceOrder.groupBy({ by: ['status'], where: baseSoWhere, _count: { _all: true } }),
            prisma_1.prisma.ticket.groupBy({ by: ['priority'], where: baseTicketWhere, _count: { _all: true } }),
            prisma_1.prisma.serviceOrder.groupBy({ by: ['priority'], where: baseSoWhere, _count: { _all: true } }),
        ]);
        return {
            totals: {
                tickets: ticketsTotal,
                openTickets: openTicketsTotal,
                serviceOrders: serviceOrdersTotal,
                pendingServiceOrders: pendingServiceOrdersTotal,
            },
            byStatus: {
                tickets: Object.fromEntries(ticketsByStatus.map((t) => [t.status, t._count._all])),
                serviceOrders: Object.fromEntries(serviceOrdersByStatus.map((s) => [s.status, s._count._all])),
            },
            byPriority: {
                tickets: Object.fromEntries(ticketsByPriority.map((t) => [t.priority ?? 'unknown', t._count._all])),
                serviceOrders: Object.fromEntries(serviceOrdersByPriority.map((s) => [s.priority ?? 'unknown', s._count._all])),
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
    async getTicketsReport(filter) {
        const { providerId, startDate, endDate, status, page = 1, limit = 20 } = filter;
        const where = { providerId, ...buildDateWhere('createdAt', startDate, endDate) };
        if (status)
            where.status = status;
        const [items, total] = await Promise.all([
            prisma_1.prisma.ticket.findMany({
                where,
                select: { id: true, status: true, priority: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.ticket.count({ where })
        ]);
        return { items, total, page, limit };
    },
    // Comentário: Lista de ordens de serviço para relatório com filtros básicos
    async getServiceOrdersReport(filter) {
        const { providerId, startDate, endDate, status, priority, customerId, page = 1, limit = 20 } = filter;
        const where = { providerId, ...buildDateWhere('createdAt', startDate, endDate) };
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (customerId)
            where.customerId = customerId;
        const [items, total] = await Promise.all([
            prisma_1.prisma.serviceOrder.findMany({
                where,
                select: {
                    id: true,
                    status: true,
                    priority: true,
                    scheduledDate: true,
                    createdAt: true,
                    ticketId: true,
                    customer: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.serviceOrder.count({ where })
        ]);
        return { items, total, page, limit };
    },
};
