"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProfileController = void 0;
const customerAuthService_1 = require("../services/customerAuthService");
class ClientProfileController {
    constructor() {
        this.service = new customerAuthService_1.CustomerAuthService();
    }
    async update(req, res) {
        try {
            const customerId = req.customer?.id;
            if (!customerId) {
                return res.status(401).json({ success: false, message: 'Não autenticado' });
            }
            const updated = await this.service.updateProfile(customerId, req.body);
            return res.json({ success: true, customer: updated });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error?.message || 'Erro ao atualizar perfil' });
        }
    }
}
exports.ClientProfileController = ClientProfileController;
