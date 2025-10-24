"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeHistoryService = void 0;
const changeHistoryRepository_1 = require("../repositories/changeHistoryRepository");
class ChangeHistoryService {
    constructor() {
        this.repo = new changeHistoryRepository_1.ChangeHistoryRepository();
    }
    async recordStatusChange(entityType, params) {
        const data = {
            entityType,
            entityId: params.entityId,
            providerId: params.providerId,
            changedById: params.changedById ?? null,
            field: 'status',
            oldValue: params.from ?? null,
            newValue: params.to,
            metadata: params.metadata ?? null
        };
        return await this.repo.create(data);
    }
    async listByEntity(providerId, entityType, entityId, page, limit) {
        return await this.repo.listByEntity(providerId, entityType, entityId, page, limit);
    }
}
exports.ChangeHistoryService = ChangeHistoryService;
