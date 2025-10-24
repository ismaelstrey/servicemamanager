"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentService = void 0;
const providerService_1 = require("./providerService");
const equipmentRepository_1 = require("../repositories/equipmentRepository");
const changeHistoryService_1 = require("./changeHistoryService");
const auditLogger_1 = require("../utils/auditLogger");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
class EquipmentService {
    constructor() {
        this.repository = new equipmentRepository_1.EquipmentRepository();
        this.providerService = new providerService_1.ProviderService();
        this.changeHistoryService = new changeHistoryService_1.ChangeHistoryService();
    }
    async assertAccess(user, providerId) {
        if (user.role === 'super_admin' || user.role === 'admin')
            return;
        const allowed = await this.providerService.userHasAccess(user.id, providerId);
        if (!allowed) {
            const err = new Error('Acesso negado: usuário não possui acesso a este provedor');
            err.status = 403;
            throw err;
        }
    }
    async list(providerId, query, user) {
        await this.assertAccess(user, providerId);
        return this.repository.listByProvider(providerId, query);
    }
    async create(providerId, data, user) {
        await this.assertAccess(user, providerId);
        const created = await this.repository.create(providerId, data);
        (0, auditLogger_1.logEquipmentAudit)('create', String(user.id), user.email, String(created.id), String(providerId), true);
        await (0, cacheMiddleware_1.invalidateProviderCache)(String(providerId));
        await (0, cacheMiddleware_1.invalidateResourceCache)('equipment', String(created.id));
        await (0, cacheMiddleware_1.invalidateResourceCache)('stats');
        return created;
    }
    async getById(id, user) {
        const equipment = await this.repository.findById(id);
        if (!equipment) {
            const err = new Error('Equipamento não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, equipment.providerId);
        (0, auditLogger_1.logEquipmentAudit)('read', String(user.id), user.email, String(id), String(equipment.providerId), true);
        return equipment;
    }
    async update(id, data, user) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            const err = new Error('Equipamento não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, existing.providerId);
        const updated = await this.repository.update(id, data);
        if (!updated) {
            const err = new Error('Falha ao atualizar equipamento');
            err.status = 500;
            throw err;
        }
        // Registrar histórico se houve mudança de status
        if (typeof data.status !== 'undefined' && data.status !== existing.status) {
            await this.changeHistoryService.recordStatusChange('equipment', {
                entityId: id,
                providerId: existing.providerId,
                changedById: user.id,
                from: existing.status,
                to: data.status,
                metadata: { label: updated.label, serial: updated.serial }
            });
            (0, auditLogger_1.logEquipmentAudit)('update', String(user.id), user.email, String(id), String(existing.providerId), true, undefined, undefined, undefined, { from: existing.status, to: data.status });
            await (0, cacheMiddleware_1.invalidateProviderCache)(String(existing.providerId));
            await (0, cacheMiddleware_1.invalidateResourceCache)('equipment', String(id));
            await (0, cacheMiddleware_1.invalidateResourceCache)('stats');
        }
        return updated;
    }
    async delete(id, user) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            const err = new Error('Equipamento não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, existing.providerId);
        const ok = await this.repository.delete(id);
        if (!ok) {
            const err = new Error('Falha ao remover equipamento');
            err.status = 500;
            throw err;
        }
        (0, auditLogger_1.logEquipmentAudit)('delete', String(user.id), user.email, String(id), String(existing.providerId), true);
        await (0, cacheMiddleware_1.invalidateProviderCache)(String(existing.providerId));
        await (0, cacheMiddleware_1.invalidateResourceCache)('equipment', String(id));
        await (0, cacheMiddleware_1.invalidateResourceCache)('stats');
        return true;
    }
    async getStats(providerId, user) {
        await this.assertAccess(user, providerId);
        return this.repository.getStatsByProvider(providerId);
    }
    // Novo: listar histórico de mudanças do equipamento
    async getHistory(id, user, page, limit) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            const err = new Error('Equipamento não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, existing.providerId);
        return await this.changeHistoryService.listByEntity(existing.providerId, 'equipment', id, page, limit);
    }
}
exports.EquipmentService = EquipmentService;
