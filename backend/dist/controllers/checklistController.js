"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistController = void 0;
const checklistService_1 = require("../services/checklistService");
class ChecklistController {
    constructor() { this.service = new checklistService_1.ChecklistService(); }
    async createTemplate(req, res) {
        try {
            const data = req.body;
            const created = await this.service.createTemplate({
                title: data.title,
                description: data.description,
                type: data.type,
                providerId: data.providerId,
                createdById: req.user?.id,
                items: data.items
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erro ao criar template' });
        }
    }
    async getTemplate(req, res) {
        const id = Number(req.params.id);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        const tpl = await this.service.getTemplate(id);
        if (!tpl)
            return res.status(404).json({ success: false, message: 'Template não encontrado' });
        res.json({ success: true, data: tpl });
    }
    async updateTemplate(req, res) {
        const id = Number(req.params.id);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        const updated = await this.service.updateTemplate(id, req.body);
        res.json({ success: true, data: updated });
    }
    async deleteTemplate(req, res) {
        const id = Number(req.params.id);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        await this.service.deleteTemplate(id);
        res.json({ success: true });
    }
    async link(req, res) {
        const link = await this.service.linkTemplate(req.body);
        res.status(201).json({ success: true, data: link });
    }
    async getLink(req, res) {
        const id = Number(req.params.linkId);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        const link = await this.service.getLink(id);
        if (!link)
            return res.status(404).json({ success: false, message: 'Vínculo não encontrado' });
        res.json({ success: true, data: link });
    }
    async updateItem(req, res) {
        const linkId = Number(req.params.linkId);
        const itemId = Number(req.params.itemId);
        if (!linkId || !itemId)
            return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
        const item = await this.service.updateItem(linkId, itemId, req.body);
        res.json({ success: true, data: item });
    }
    async deleteLink(req, res) {
        const id = Number(req.params.linkId);
        if (!id || id <= 0)
            return res.status(400).json({ success: false, message: 'ID inválido' });
        await this.service.deleteLink(id);
        res.json({ success: true });
    }
}
exports.ChecklistController = ChecklistController;
