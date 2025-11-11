"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClientRole = requireClientRole;
/**
 * Middleware de RBAC para clientes.
 * Exige que o cliente autenticado tenha um dos papéis permitidos.
 * Perfis suportados: 'customer_admin', 'customer_user'
 */
function requireClientRole(allowedRoles) {
    return function (req, res, next) {
        const role = req.customer?.role || 'customer_user';
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ success: false, message: 'Permissão insuficiente' });
        }
        next();
    };
}
