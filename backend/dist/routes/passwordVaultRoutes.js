"use strict";
/**
 * @swagger
 * tags:
 *   name: Passwords
 *   description: Cofre de senhas
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @swagger
 * /api/providers/{providerId}/passwords:
 *   get:
 *     summary: Lista senhas do provedor
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista retornada
 *   post:
 *     summary: Cria senha
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Senha criada
 */
const express_1 = require("express");
const passwordVaultController_1 = require("../controllers/passwordVaultController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rateLimitMiddleware_1 = require("../middlewares/rateLimitMiddleware");
const passwordVaultValidator_1 = require("../validators/passwordVaultValidator");
const router = (0, express_1.Router)();
const controller = new passwordVaultController_1.PasswordVaultController();
// Protegidas: exigem autenticação e rate limiting sensível
router.get('/:providerId/passwords', authMiddleware_1.authMiddleware, rateLimitMiddleware_1.sensitiveRateLimit, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.providerIdParamSchema), (0, passwordVaultValidator_1.validateQuery)(passwordVaultValidator_1.listPasswordVaultsSchema), (req, res) => controller.list(req, res));
router.post('/:providerId/passwords', authMiddleware_1.authMiddleware, rateLimitMiddleware_1.createResourceRateLimit, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.providerIdParamSchema), (0, passwordVaultValidator_1.validateSchema)(passwordVaultValidator_1.createPasswordVaultSchema), (req, res) => controller.create(req, res));
// CRUD por ID com rate limiting sensível
router.get('/passwords/:id', authMiddleware_1.authMiddleware, rateLimitMiddleware_1.sensitiveRateLimit, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.vaultIdParamSchema), (req, res) => controller.getById(req, res));
router.put('/passwords/:id', authMiddleware_1.authMiddleware, rateLimitMiddleware_1.sensitiveRateLimit, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.vaultIdParamSchema), (0, passwordVaultValidator_1.validateSchema)(passwordVaultValidator_1.updatePasswordVaultSchema), (req, res) => controller.update(req, res));
router.post('/passwords/:id/rotate', authMiddleware_1.authMiddleware, rateLimitMiddleware_1.sensitiveRateLimit, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.vaultIdParamSchema), (0, passwordVaultValidator_1.validateSchema)(passwordVaultValidator_1.rotatePasswordSchema), (req, res) => controller.rotate(req, res));
router.delete('/passwords/:id', authMiddleware_1.authMiddleware, rateLimitMiddleware_1.sensitiveRateLimit, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.vaultIdParamSchema), (req, res) => controller.delete(req, res));
exports.default = router;
