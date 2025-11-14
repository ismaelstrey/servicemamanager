"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCatalogController = void 0;
const serviceCatalogService_1 = require("../services/serviceCatalogService");
class ServiceCatalogController {
    constructor() { this.service = new serviceCatalogService_1.ServiceCatalogService(); }
    async createService(req, res) { const providerId = Number(req.params.providerId); const created = await this.service.createService(providerId, req.body); res.status(201).json({ success: true, data: created }); }
    async listServices(req, res) { const providerId = Number(req.params.providerId); const isActive = typeof req.query.isActive !== 'undefined' ? String(req.query.isActive).toLowerCase() === 'true' : undefined; const items = await this.service.listServices(providerId, isActive); res.json({ success: true, data: items }); }
    async getService(req, res) { const id = Number(req.params.id); const row = await this.service.getService(id); if (!row)
        return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: row }); }
    async updateService(req, res) { const id = Number(req.params.id); const row = await this.service.updateService(id, req.body); res.json({ success: true, data: row }); }
    async deleteService(req, res) { const id = Number(req.params.id); await this.service.deleteService(id); res.json({ success: true }); }
    async createCredential(req, res) { const serviceId = Number(req.params.serviceId); const created = await this.service.createCredential(serviceId, req.body); res.status(201).json({ success: true, data: created }); }
    async listCredentials(req, res) { const serviceId = Number(req.params.serviceId); const creds = await this.service.listCredentials(serviceId, req.user, []); res.json({ success: true, data: creds }); }
    async getCredential(req, res) { const id = Number(req.params.id); const cred = await this.service.getCredential(id, req.user, []); if (!cred)
        return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: cred }); }
    async updateCredential(req, res) { const id = Number(req.params.id); const row = await this.service.updateCredential(id, req.body); res.json({ success: true, data: row }); }
    async deleteCredential(req, res) { const id = Number(req.params.id); await this.service.deleteCredential(id); res.json({ success: true }); }
    async setCredentialUsers(req, res) { const id = Number(req.params.id); const ok = await this.service.setCredentialUsers(id, req.body.userIds); res.json({ success: true, data: ok }); }
    async setCredentialGroups(req, res) { const id = Number(req.params.id); const ok = await this.service.setCredentialGroups(id, req.body.groupIds); res.json({ success: true, data: ok }); }
    async removeCredentialUser(req, res) { const id = Number(req.params.id); const providerUserId = Number(req.params.providerUserId); await this.service.removeCredentialUser(id, providerUserId); res.json({ success: true }); }
    async removeCredentialGroup(req, res) { const id = Number(req.params.id); const groupId = Number(req.params.groupId); await this.service.removeCredentialGroup(id, groupId); res.json({ success: true }); }
}
exports.ServiceCatalogController = ServiceCatalogController;
