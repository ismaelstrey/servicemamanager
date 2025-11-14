"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupController = void 0;
const groupService_1 = require("../services/groupService");
class GroupController {
    constructor() { this.service = new groupService_1.GroupService(); }
    async create(req, res) { const providerId = Number(req.params.providerId); const created = await this.service.create(providerId, req.body); res.status(201).json({ success: true, data: created }); }
    async list(req, res) { const providerId = Number(req.params.providerId); const items = await this.service.list(providerId); res.json({ success: true, data: items }); }
    async get(req, res) { const id = Number(req.params.id); const row = await this.service.get(id); if (!row)
        return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: row }); }
    async update(req, res) { const id = Number(req.params.id); const row = await this.service.update(id, req.body); res.json({ success: true, data: row }); }
    async addMembers(req, res) { const id = Number(req.params.id); const ok = await this.service.addMembers(id, req.body.providerUserIds); res.json({ success: true, data: ok }); }
    async removeMember(req, res) { const id = Number(req.params.id); const providerUserId = Number(req.params.providerUserId); await this.service.removeMember(id, providerUserId); res.json({ success: true }); }
}
exports.GroupController = GroupController;
