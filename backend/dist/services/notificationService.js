"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notificationRepository_1 = require("../repositories/notificationRepository");
class NotificationService {
    constructor() {
        this.repo = new notificationRepository_1.NotificationRepository();
    }
    async createStatusChangeNotification(params) {
        const title = params.title || (params.entityType === 'ticket' ? 'Status do Ticket atualizado' : 'Status da OS atualizado');
        const message = `${params.actorName ? params.actorName + ' ' : ''}alterou o status ${params.entityType === 'ticket' ? 'do ticket' : 'da OS'} ${params.entityId} de ${params.statusFrom ?? 'desconhecido'} para ${params.statusTo}`;
        const data = {
            type: `${params.entityType}_status_changed`,
            entityType: params.entityType,
            entityId: params.entityId,
            title,
            message,
            statusFrom: params.statusFrom ?? null,
            statusTo: params.statusTo,
            providerId: params.providerId,
            userId: null
        };
        return await this.repo.create(data);
    }
    async listByProvider(providerId, query) {
        return await this.repo.listByProvider(providerId, query);
    }
    async markRead(id) {
        return await this.repo.markRead(id);
    }
    async markAllReadByProvider(providerId) {
        return await this.repo.markAllReadByProvider(providerId);
    }
    async listByCustomer(customerId, providerId, query) {
        return await this.repo.listByCustomer(customerId, providerId, query);
    }
    async markReadForCustomer(id, customerId) {
        return await this.repo.markReadForCustomer(id, customerId);
    }
}
exports.NotificationService = NotificationService;
