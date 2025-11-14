"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchController = void 0;
const branchService_1 = require("../services/branchService");
class BranchController {
    constructor() { this.service = new branchService_1.BranchService(); }
    async create(req, res) { const providerId = Number(req.params.providerId); const created = await this.service.create(providerId, req.body); res.status(201).json({ success: true, data: created }); }
    async list(req, res) { const providerId = Number(req.params.providerId); const items = await this.service.list(providerId); res.json({ success: true, data: items }); }
    async get(req, res) { const id = Number(req.params.id); const row = await this.service.getById(id); if (!row)
        return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: row }); }
    async update(req, res) { const id = Number(req.params.id); const row = await this.service.update(id, req.body); res.json({ success: true, data: row }); }
    async delete(req, res) { const id = Number(req.params.id); await this.service.delete(id); res.json({ success: true }); }
}
exports.BranchController = BranchController;
