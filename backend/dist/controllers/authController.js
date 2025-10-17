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
        const parse = authValidators_1.registerSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json({ errors: parse.error.flatten() });
            return;
        }
        const { name, email, password } = parse.data;
        const result = await this.authService.register(name, email, password);
        res.status(201).json(result);
    }
    // POST /auth/login
    async login(req, res) {
        const parse = authValidators_1.loginSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json({ errors: parse.error.flatten() });
            return;
        }
        const { email, password } = parse.data;
        const result = await this.authService.login(email, password);
        if (!result) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }
        res.json(result);
    }
}
exports.AuthController = AuthController;
