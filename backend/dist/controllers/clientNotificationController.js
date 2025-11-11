"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientNotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
const paginationHelper_1 = require("../utils/paginationHelper");
class ClientNotificationController {
    constructor() {
        this.notificationService = new notificationService_1.NotificationService();
    }
    /**
     * Listar notificações do cliente autenticado
     * GET /api/client/notifications
     */
    async list(req, res) {
        try {
            const customer = req.customer;
            if (!customer?.id) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const { page, limit } = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                maxLimit: 100,
                defaultLimit: 10
            });
            const unreadParam = req.query.unread;
            const unread = typeof unreadParam === 'string'
                ? unreadParam.toLowerCase() === 'true'
                    ? true
                    : unreadParam.toLowerCase() === 'false'
                        ? false
                        : undefined
                : undefined;
            const result = await this.notificationService.listByCustomer(customer.id, customer.providerId, { page, limit, unread });
            res.json({
                success: true,
                data: result.notifications,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                },
                message: 'Notificações listadas com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar notificações';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
    /**
     * Marcar notificação como lida (escopo cliente)
     * PUT /api/client/notifications/:id/read
     */
    async markRead(req, res) {
        try {
            const customerId = req.customer?.id;
            if (!customerId) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const ok = await this.notificationService.markReadForCustomer(id, customerId);
            if (!ok) {
                res.status(404).json({ success: false, message: 'Notificação não encontrada' });
                return;
            }
            res.json({ success: true, message: 'Notificação marcada como lida' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao marcar notificação como lida';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
}
exports.ClientNotificationController = ClientNotificationController;
