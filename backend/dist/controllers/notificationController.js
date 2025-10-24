"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
const providerService_1 = require("../services/providerService");
const paginationHelper_1 = require("../utils/paginationHelper");
class NotificationController {
    constructor() {
        this.notificationService = new notificationService_1.NotificationService();
        this.providerService = new providerService_1.ProviderService();
    }
    /**
     * Listar notificações por provedor
     * GET /api/providers/:providerId/notifications
     */
    async list(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            // Verificar acesso ao provider
            await this.providerService.findById(providerId, req.user);
            const { page, limit } = (0, paginationHelper_1.calculatePagination)({
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                maxLimit: 100,
                defaultLimit: 10
            });
            const unreadParam = req.query.unread;
            const unread = typeof unreadParam === 'string' ? unreadParam.toLowerCase() === 'true' ? true : unreadParam.toLowerCase() === 'false' ? false : undefined : undefined;
            const result = await this.notificationService.listByProvider(providerId, { page, limit, unread });
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
     * Marcar notificação como lida
     * POST /api/providers/notifications/:id/read
     */
    async markRead(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'id inválido' });
                return;
            }
            const ok = await this.notificationService.markRead(id);
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
    /**
     * Marcar todas notificações de um provider como lidas
     * POST /api/providers/:providerId/notifications/mark-all-read
     */
    async markAllRead(req, res) {
        try {
            const providerId = parseInt(req.params.providerId);
            if (isNaN(providerId)) {
                res.status(400).json({ success: false, message: 'providerId inválido' });
                return;
            }
            // Verificar acesso ao provider
            await this.providerService.findById(providerId, req.user);
            const count = await this.notificationService.markAllReadByProvider(providerId);
            res.json({ success: true, data: { updated: count }, message: 'Notificações marcadas como lidas' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao marcar todas como lidas';
            const status = error?.status || 500;
            res.status(status).json({ success: false, message });
        }
    }
}
exports.NotificationController = NotificationController;
