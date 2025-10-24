"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const client_1 = require("@prisma/client");
class NotificationRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(data) {
        const notification = await this.prisma.notification.create({
            data: {
                type: data.type,
                entityType: data.entityType,
                entityId: data.entityId,
                title: data.title,
                message: data.message,
                statusFrom: data.statusFrom ?? null,
                statusTo: data.statusTo ?? null,
                providerId: data.providerId,
                userId: data.userId ?? null
            }
        });
        return notification;
    }
    async listByProvider(providerId, query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
        const skip = (page - 1) * limit;
        const where = { providerId };
        if (typeof query.unread === 'boolean') {
            where.isRead = !query.unread ? undefined : false;
        }
        const [total, items] = await Promise.all([
            this.prisma.notification.count({ where }),
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);
        return { notifications: items, total, page, limit };
    }
    async markRead(id) {
        const updated = await this.prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() }
        });
        return !!updated;
    }
    async markAllReadByProvider(providerId) {
        const result = await this.prisma.notification.updateMany({
            where: { providerId, isRead: false },
            data: { isRead: true, readAt: new Date() }
        });
        return result.count || 0;
    }
}
exports.NotificationRepository = NotificationRepository;
