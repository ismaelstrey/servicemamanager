"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const clientTicketController_1 = require("../controllers/clientTicketController");
const clientAuthMiddleware_1 = require("../middlewares/clientAuthMiddleware");
const providerValidator_1 = require("../validators/providerValidator");
const clientValidator_1 = require("../validators/clientValidator");
const ticketValidator_1 = require("../validators/ticketValidator");
const router = (0, express_1.Router)();
const controller = new clientTicketController_1.ClientTicketController();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// Listar tickets do cliente
router.get('/', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateQuery)(clientValidator_1.clientListTicketsSchema), (req, res) => controller.list(req, res));
// Criar ticket
router.post('/', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateSchema)(clientValidator_1.clientCreateTicketSchema), (req, res) => controller.create(req, res));
// Obter detalhes do ticket por ID
router.get('/:id', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (req, res) => controller.getById(req, res));
// Timeline unificada do ticket do cliente
router.get('/:id/timeline', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, providerValidator_1.validateQuery)(ticketValidator_1.historyQuerySchema), (req, res) => controller.timeline(req, res));
// Histórico do ticket do cliente
router.get('/:id/history', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, providerValidator_1.validateQuery)(ticketValidator_1.historyQuerySchema), (req, res) => controller.history(req, res));
// Adicionar comentário do cliente ao ticket
router.post('/:id/comments', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), (0, providerValidator_1.validateSchema)(clientValidator_1.clientCommentSchema), (req, res) => controller.comment(req, res));
// Upload de anexos para ticket do cliente (multipart/form-data, field "file")
router.post('/:id/attachments', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(ticketValidator_1.ticketIdParamSchema), upload.single('file'), (req, res) => controller.uploadAttachment(req, res));
exports.default = router;
