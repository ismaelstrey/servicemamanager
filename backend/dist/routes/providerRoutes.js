"use strict";
/**
 * @swagger
 * tags:
 *   name: Providers
 *   description: Operações de provedores
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @swagger
 * /api/providers/check-workspace/{workspace}:
 *   get:
 *     summary: Verifica disponibilidade de workspace
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: workspace
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Situação do workspace
 */
/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Lista provedores
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada
 */
/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     summary: Detalha provedor
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes retornados
 */
const express_1 = require("express");
const providerController_1 = require("../controllers/providerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const providerValidator_1 = require("../validators/providerValidator");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
// Rotas de provedores
const router = (0, express_1.Router)();
const controller = new providerController_1.ProviderController();
// Public: verificar disponibilidade de workspace
router.get('/check-workspace/:workspace', (0, providerValidator_1.validateParams)(providerValidator_1.workspaceParamSchema), (req, res) => controller.checkWorkspace(req, res));
// Protegidas: todas abaixo exigem autenticação
router.post('/', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateSchema)(providerValidator_1.createProviderSchema), (req, res) => controller.create(req, res));
router.get('/', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateQuery)(providerValidator_1.listProvidersSchema), (0, cacheMiddleware_1.listCacheMiddleware)(), (req, res) => controller.list(req, res));
router.get('/:id', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.providerIdSchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 1800, keyPrefix: 'provider:detail', varyBy: ['id'] }), (req, res) => controller.getById(req, res));
router.get('/workspace/:workspace', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.workspaceParamSchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 1800, keyPrefix: 'provider:workspace', varyBy: ['workspace'] }), (req, res) => controller.getByWorkspace(req, res));
router.put('/:id', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.providerIdSchema), (0, providerValidator_1.validateSchema)(providerValidator_1.updateProviderSchema), (req, res) => controller.update(req, res));
router.delete('/:id', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.providerIdSchema), (req, res) => controller.delete(req, res));
router.patch('/:id/status', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.providerIdSchema), (0, providerValidator_1.validateSchema)(providerValidator_1.updateStatusSchema), (req, res) => controller.toggleStatus(req, res));
router.get('/:id/stats', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.providerIdSchema), (req, res) => controller.getStats(req, res));
router.post('/:id/invite', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.providerIdSchema), (0, providerValidator_1.validateSchema)(providerValidator_1.inviteUserSchema), (req, res) => controller.inviteUser(req, res));
router.get('/:id/users', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.providerIdSchema), (req, res) => controller.getUsers(req, res));
router.put('/:id/settings', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateParams)(providerValidator_1.providerIdSchema), (0, providerValidator_1.validateSchema)(providerValidator_1.providerSettingsSchema), (req, res) => controller.updateSettings(req, res));
exports.default = router;
