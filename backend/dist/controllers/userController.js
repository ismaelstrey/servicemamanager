"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = __importDefault(require("../services/userService"));
class UserController {
    constructor() {
        this.service = new userService_1.default();
    }
    async list(req, res) {
        try {
            const result = await this.service.list(req.query);
            const { items, total, page, limit } = result;
            const totalPages = Math.max(1, Math.ceil(Number(total) / Number(limit || 1)));
            return res.json({ success: true, data: items, pagination: { total, page, limit, totalPages } });
        }
        catch (e) {
            return res.status(400).json({ success: false, message: 'Falha ao listar usuários' });
        }
    }
    async getById(req, res) {
        try {
            const user = await this.service.getById(Number(req.params.id));
            if (!user)
                return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
            return res.json({ success: true, data: user });
        }
        catch {
            return res.status(400).json({ success: false, message: 'Falha ao obter usuário' });
        }
    }
    async create(req, res) {
        try {
            if (req.user?.role !== 'admin')
                return res.status(403).json({ success: false, message: 'Permissão negada' });
            const created = await this.service.create(req.body);
            return res.status(201).json({ success: true, data: created });
        }
        catch (e) {
            if (e?.message === 'EMAIL_IN_USE')
                return res.status(409).json({ success: false, message: 'Email já utilizado' });
            return res.status(400).json({ success: false, message: 'Falha ao criar usuário' });
        }
    }
    async update(req, res) {
        try {
            if (req.user?.role !== 'admin')
                return res.status(403).json({ success: false, message: 'Permissão negada' });
            const id = Number(req.params.id);
            const updated = await this.service.update(id, req.body);
            return res.json({ success: true, data: updated });
        }
        catch {
            return res.status(400).json({ success: false, message: 'Falha ao atualizar usuário' });
        }
    }
    async disable(req, res) {
        try {
            if (req.user?.role !== 'admin')
                return res.status(403).json({ success: false, message: 'Permissão negada' });
            const id = Number(req.params.id);
            const updated = await this.service.disable(id);
            return res.json({ success: true, data: updated });
        }
        catch {
            return res.status(400).json({ success: false, message: 'Falha ao desativar usuário' });
        }
    }
    async enable(req, res) {
        try {
            if (req.user?.role !== 'admin')
                return res.status(403).json({ success: false, message: 'Permissão negada' });
            const id = Number(req.params.id);
            const updated = await this.service.enable(id);
            return res.json({ success: true, data: updated });
        }
        catch {
            return res.status(400).json({ success: false, message: 'Falha ao reativar usuário' });
        }
    }
}
exports.UserController = UserController;
exports.default = UserController;
