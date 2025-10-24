"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authValidators_1 = require("../validators/authValidators");
const auditLogger_1 = require("../utils/auditLogger");
// Controller de autenticação para registro e login
class AuthController {
    constructor() {
        this.authService = new authService_1.AuthService();
    }
    // POST /auth/register
    async register(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        let userEmail;
        try {
            const parse = authValidators_1.registerSchema.safeParse(req.body);
            if (!parse.success) {
                res.status(400).json({ errors: parse.error.flatten() });
                return;
            }
            const { name, email, password } = parse.data;
            userEmail = email;
            const result = await this.authService.register(name, email, password);
            // Log de auditoria para registro bem-sucedido
            (0, auditLogger_1.logAuthAudit)('register', result.user?.id?.toString(), email, true, ipAddress, userAgent);
            res.status(201).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
            const isUniqueEmail = message.includes('Unique constraint') || message.includes('já existe');
            // Log de auditoria para registro falhado
            (0, auditLogger_1.logAuthAudit)('register', undefined, userEmail, false, ipAddress, userAgent, message);
            res.status(isUniqueEmail ? 409 : 500).json({ success: false, message });
        }
    }
    // POST /auth/login
    async login(req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        let userEmail;
        try {
            const parse = authValidators_1.loginSchema.safeParse(req.body);
            if (!parse.success) {
                res.status(400).json({ errors: parse.error.flatten() });
                return;
            }
            const { email, password } = parse.data;
            userEmail = email;
            const result = await this.authService.login(email, password);
            // Log de auditoria para login bem-sucedido
            (0, auditLogger_1.logAuthAudit)('login', result.user?.id?.toString(), email, true, ipAddress, userAgent);
            res.json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao efetuar login';
            // Log de auditoria para login falhado
            (0, auditLogger_1.logAuthAudit)('login', undefined, userEmail, false, ipAddress, userAgent, message);
            res.status(401).json({ success: false, message });
        }
    }
}
exports.AuthController = AuthController;
