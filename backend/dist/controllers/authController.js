"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authValidators_1 = require("../validators/authValidators");
// Controller de autenticação para registro e login
class AuthController {
    constructor() {
        this.authService = new authService_1.AuthService();
    }
    // POST /auth/register
    async register(req, res) {
        try {
            const parse = authValidators_1.registerSchema.safeParse(req.body);
            if (!parse.success) {
                res.status(400).json({ errors: parse.error.flatten() });
                return;
            }
            const { name, email, password } = parse.data;
            const result = await this.authService.register(name, email, password);
            res.status(201).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
            const isUniqueEmail = message.includes('Unique constraint') || message.includes('já existe');
            res.status(isUniqueEmail ? 409 : 500).json({ success: false, message });
        }
    }
    // POST /auth/login
    async login(req, res) {
        try {
            const parse = authValidators_1.loginSchema.safeParse(req.body);
            if (!parse.success) {
                res.status(400).json({ errors: parse.error.flatten() });
                return;
            }
            const { email, password } = parse.data;
            const result = await this.authService.login(email, password);
            res.json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao efetuar login';
            res.status(401).json({ success: false, message });
        }
    }
}
exports.AuthController = AuthController;
