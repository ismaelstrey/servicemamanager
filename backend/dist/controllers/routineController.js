"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineController = void 0;
const routineService_1 = require("../services/routineService");
class RoutineController {
    constructor() { this.service = new routineService_1.RoutineService(); }
    async create(req, res) {
        try {
            const created = await this.service.create(req.body);
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erro ao criar rotina' });
        }
    }
    async list(req, res) {
        const { providerId, enabled } = req.query;
        const items = await this.service.list({ providerId, enabled });
        res.json({ success: true, data: items });
    }
    async getById(req, res) {
        const id = Number(req.params.id);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        const row = await this.service.getById(id);
        if (!row)
            return res.status(404).json({ success: false, message: 'Rotina não encontrada' });
        res.json({ success: true, data: row });
    }
    async update(req, res) {
        const id = Number(req.params.id);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        const updated = await this.service.update(id, req.body);
        res.json({ success: true, data: updated });
    }
    async testRun(req, res) {
        const id = Number(req.params.id);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        const result = await this.service.testRun(id);
        res.json({ success: true, data: result });
    }
    async logs(req, res) {
        const id = Number(req.params.id);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        const rows = await this.service.logs(id);
        res.json({ success: true, data: rows });
    }
}
exports.RoutineController = RoutineController;
