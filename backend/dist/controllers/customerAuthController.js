"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAuthController = void 0;
const customerAuthService_1 = require("../services/customerAuthService");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter ao menos 6 caracteres')
});
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome muito curto'),
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
    providerId: zod_1.z.coerce.number().int().positive('providerId inválido'),
    role: zod_1.z.enum(['customer_admin', 'customer_user']).optional(),
    phone: zod_1.z.string().optional(),
    document: zod_1.z.string().optional()
});
const forgotSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido')
});
const resetSchema = zod_1.z.object({
    token: zod_1.z.string().min(32, 'Token inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter ao menos 6 caracteres')
});
class CustomerAuthController {
    constructor() {
        this.service = new customerAuthService_1.CustomerAuthService();
    }
    async login(req, res) {
        try {
            const parsed = loginSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const { email, password } = parsed.data;
            const result = await this.service.login(email, password);
            res.json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao efetuar login do cliente';
            res.status(message.includes('Credenciais') ? 401 : 500).json({ success: false, message });
        }
    }
    async register(req, res) {
        try {
            const parsed = registerSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const result = await this.service.register(parsed.data);
            res.status(201).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao registrar cliente';
            res.status(500).json({ success: false, message });
        }
    }
    async profile(req, res) {
        try {
            const cid = req.customer?.id;
            if (!cid) {
                res.status(401).json({ message: 'Não autenticado' });
                return;
            }
            const customer = await this.service.profile(cid);
            res.json({ success: true, data: customer });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao obter perfil';
            res.status(500).json({ success: false, message });
        }
    }
    async forgotPassword(req, res) {
        try {
            const parsed = forgotSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const { email } = parsed.data;
            const result = await this.service.forgotPassword(email);
            res.json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao iniciar recuperação de senha';
            res.status(500).json({ success: false, message });
        }
    }
    async resetPassword(req, res) {
        try {
            const parsed = resetSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }
            const { token, password } = parsed.data;
            const result = await this.service.resetPassword(token, password);
            res.json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao concluir recuperação de senha';
            const isTokenError = message.includes('Token inválido');
            res.status(isTokenError ? 400 : 500).json({ success: false, message });
        }
    }
}
exports.CustomerAuthController = CustomerAuthController;
