"use strict";
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e registro
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Usuário criado
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 */
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const rateLimitMiddleware_1 = require("../middlewares/rateLimitMiddleware");
// Rotas de autenticação agrupadas
const router = (0, express_1.Router)();
const controller = new authController_1.AuthController();
router.post('/register', rateLimitMiddleware_1.authRateLimit, (req, res) => controller.register(req, res));
router.post('/login', rateLimitMiddleware_1.authRateLimit, (req, res) => controller.login(req, res));
exports.default = router;
