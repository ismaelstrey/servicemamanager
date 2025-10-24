"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const rateLimitMiddleware_1 = require("../middlewares/rateLimitMiddleware");
// Rotas de autenticação agrupadas
const router = (0, express_1.Router)();
const controller = new authController_1.AuthController();
router.post('/register', rateLimitMiddleware_1.authRateLimit, (req, res) => controller.register(req, res));
router.post('/login', rateLimitMiddleware_1.authRateLimit, (req, res) => controller.login(req, res));
exports.default = router;
