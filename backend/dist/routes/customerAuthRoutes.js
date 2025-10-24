"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerAuthController_1 = require("../controllers/customerAuthController");
const clientAuthMiddleware_1 = require("../middlewares/clientAuthMiddleware");
const rateLimitMiddleware_1 = require("../middlewares/rateLimitMiddleware");
const router = (0, express_1.Router)();
const controller = new customerAuthController_1.CustomerAuthController();
// Registro do cliente
router.post('/register', rateLimitMiddleware_1.authRateLimit, (req, res) => controller.register(req, res));
// Login do cliente
router.post('/login', rateLimitMiddleware_1.authRateLimit, (req, res) => controller.login(req, res));
// Recuperação de senha
router.post('/forgot-password', rateLimitMiddleware_1.authRateLimit, (req, res) => controller.forgotPassword(req, res));
router.post('/reset-password', rateLimitMiddleware_1.authRateLimit, (req, res) => controller.resetPassword(req, res));
// Perfil do cliente autenticado
router.get('/profile', clientAuthMiddleware_1.clientAuthMiddleware, (req, res) => controller.profile(req, res));
exports.default = router;
