"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordVaultService = void 0;
const providerService_1 = require("./providerService");
const passwordVaultRepository_1 = require("../repositories/passwordVaultRepository");
const encryptionUtils_1 = require("../utils/encryptionUtils");
class PasswordVaultService {
    constructor() {
        this.repository = new passwordVaultRepository_1.PasswordVaultRepository();
        this.providerService = new providerService_1.ProviderService();
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
    canViewSecrets(user) {
        return user.role === 'super_admin' || user.role === 'admin' || user.role === 'manager';
    }
    async list(providerId, query, user) {
        await this.assertAccess(user, providerId);
        return this.repository.listByProvider(providerId, query);
    }
    async create(providerId, data, user) {
        await this.assertAccess(user, providerId);
        const encrypted = (0, encryptionUtils_1.encryptString)(data.password);
        const created = await this.repository.create(providerId, { ...data, password: encrypted });
        const { password, ...rest } = created;
        return rest;
    }
    async getById(id, user) {
        const rec = await this.repository.findById(id);
        if (!rec) {
            const err = new Error('Registro de senha não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, rec.providerId);
        if (this.canViewSecrets(user)) {
            return { ...rec, password: (0, encryptionUtils_1.decryptString)(rec.password) };
        }
        const { password, ...rest } = rec;
        return rest;
    }
    async update(id, data, user) {
        const current = await this.repository.findById(id);
        if (!current) {
            const err = new Error('Registro de senha não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, current.providerId);
        const updateData = { ...data };
        if (data.password) {
            updateData.password = (0, encryptionUtils_1.encryptString)(data.password);
        }
        const updated = await this.repository.update(id, updateData);
        if (!updated) {
            const err = new Error('Registro de senha não encontrado');
            err.status = 404;
            throw err;
        }
        if (this.canViewSecrets(user)) {
            return { ...updated, password: data.password ? data.password : (0, encryptionUtils_1.decryptString)(updated.password) };
        }
        const { password, ...rest } = updated;
        return rest;
    }
    async delete(id, user) {
        const current = await this.repository.findById(id);
        if (!current) {
            const err = new Error('Registro de senha não encontrado');
            err.status = 404;
            throw err;
        }
        await this.assertAccess(user, current.providerId);
        return this.repository.delete(id);
    }
}
exports.PasswordVaultService = PasswordVaultService;
