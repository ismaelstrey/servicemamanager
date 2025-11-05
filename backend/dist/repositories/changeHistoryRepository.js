"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeHistoryRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ChangeHistoryRepository {
    constructor() {
        this.prisma = prisma_1.prisma;
    }
    async create(data) {
        const entry = await this.prisma.changeHistory.create({
            data: {
                entityType: data.entityType,
                entityId: data.entityId,
                providerId: data.providerId,
                changedById: data.changedById ?? null,
                field: data.field,
                oldValue: data.oldValue ?? null,
                newValue: data.newValue ?? null,
                metadata: data.metadata ?? null
            }
        });
        return entry;
    }
    async listByEntity(providerId, entityType, entityId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = { providerId, entityType, entityId };
        const [total, items] = await Promise.all([
            this.prisma.changeHistory.count({ where }),
            this.prisma.changeHistory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);
        return { history: items, total, page, limit };
    }
}
exports.ChangeHistoryRepository = ChangeHistoryRepository;
