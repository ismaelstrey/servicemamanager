/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e registro
 */

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

import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authRateLimit } from '../middlewares/rateLimitMiddleware';

// Rotas de autenticação agrupadas
const router = Router();
const controller = new AuthController();

router.post('/register', authRateLimit, (req, res) => controller.register(req, res));
router.post('/login', authRateLimit, (req, res) => controller.login(req, res));

export default router;