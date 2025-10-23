"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const ticketValidator_1 = require("../validators/ticketValidator");
const router = (0, express_1.Router)();
const controller = new ticketController_1.TicketController();
// Protegidas: exigem autenticação
router.get('/:providerId/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, ticketValidator_1.validateQuery)(ticketValidator_1.listTicketsSchema), (req, res) => controller.list(req, res));
router.post('/:providerId/tickets', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.createTicketSchema), (req, res) => controller.create(req, res));
router.get('/:providerId/tickets/stats', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.providerIdParamSchema), (req, res) => controller.getStats(req, res));
// CRUD por ID de ticket
router.get('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (req, res) => controller.getById(req, res));
router.put('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.updateTicketSchema), (req, res) => controller.update(req, res));
router.put('/tickets/:id/status', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, ticketValidator_1.validateSchema)(ticketValidator_1.updateTicketStatusSchema), (req, res) => controller.updateStatus(req, res));
router.delete('/tickets/:id', authMiddleware_1.authMiddleware, (0, ticketValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (req, res) => controller.delete(req, res));
exports.default = router;
