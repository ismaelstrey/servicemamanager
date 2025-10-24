"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const ticketValidator_1 = require("../validators/ticketValidator");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = (0, express_1.Router)();
const controller = new ticketController_1.TicketController();
// Protegidas: exigem autenticação com cache para consultas
router.get('/:providerId/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, ticketValidator_1.validateQuery)(ticketValidator_1.listTicketsSchema), (0, cacheMiddleware_1.listCacheMiddleware)(), (req, res) => controller.list(req, res));
router.get('/:providerId/tickets/kanban', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 60, keyPrefix: 'kanban', varyBy: ['userId', 'providerId'] }), (req, res) => controller.kanban(req, res));
router.post('/:providerId/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.createTicketSchema), (req, res) => controller.create(req, res));
router.get('/:providerId/tickets/stats', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, cacheMiddleware_1.statsCacheMiddleware)(), (req, res) => controller.getStats(req, res));
// CRUD por ID de ticket com cache para consultas
router.get('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, cacheMiddleware_1.ticketCacheMiddleware)(), (req, res) => controller.getById(req, res));
router.get('/tickets/:id/history', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, ticketValidator_1.validateQuery)(ticketValidator_1.historyQuerySchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 120, keyPrefix: 'history', varyBy: ['userId', 'providerId', 'params.id', 'query.page', 'query.limit'] }), (req, res) => controller.history(req, res));
router.put('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.updateTicketSchema), (req, res) => controller.update(req, res));
router.put('/tickets/:id/status', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.updateTicketStatusSchema), (req, res) => controller.updateStatus(req, res));
router.delete('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (req, res) => controller.delete(req, res));
// Novo: criar ticket automaticamente vinculado ao provedor do usuário
router.post('/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateSchema)(ticketValidator_1.createTicketSchema), (req, res) => controller.createForCurrentProvider(req, res));
exports.default = router;
