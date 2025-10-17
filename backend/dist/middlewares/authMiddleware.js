"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwtUtils_1 = require("../utils/jwtUtils");
// Middleware para proteger rotas com JWT
function authMiddleware(req, res, next) {
    // Lê cabeçalho Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Token não fornecido' });
        return;
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const payload = (0, jwtUtils_1.verifyToken)(token);
        // @ts-expect-error anexar usuário ao request
        req.user = payload;
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
}
