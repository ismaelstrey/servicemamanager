"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientAuthMiddleware = clientAuthMiddleware;
const jwtUtils_1 = require("../utils/jwtUtils");
function clientAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwtUtils_1.verifyToken)(token);
        req.customer = { id: payload.customerId, email: payload.email, providerId: payload.providerId, role: payload.role };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
}
