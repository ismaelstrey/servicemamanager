"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const clientServiceOrderController_1 = require("../controllers/clientServiceOrderController");
const clientAuthMiddleware_1 = require("../middlewares/clientAuthMiddleware");
const providerValidator_1 = require("../validators/providerValidator");
const clientRbacMiddleware_1 = require("../middlewares/clientRbacMiddleware");
const clientAuditMiddleware_1 = require("../middleware/clientAuditMiddleware");
const clientValidator_1 = require("../validators/clientValidator");
const serviceOrderValidator_1 = require("../validators/serviceOrderValidator");
const router = (0, express_1.Router)();
const controller = new clientServiceOrderController_1.ClientServiceOrderController();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// Listar OS do cliente
router.get('/', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateQuery)(clientValidator_1.clientListServiceOrdersSchema), (req, res) => controller.list(req, res));
// Detalhar OS do cliente
router.get('/:id', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (req, res) => controller.getById(req, res));
// Timeline unificada da OS do cliente
router.get('/:id/timeline', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (0, providerValidator_1.validateQuery)(serviceOrderValidator_1.historyQuerySchema), (req, res) => controller.timeline(req, res));
// Histórico da OS do cliente
router.get('/:id/history', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (0, providerValidator_1.validateQuery)(serviceOrderValidator_1.historyQuerySchema), (req, res) => controller.history(req, res));
// Criar OS
router.post('/', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateSchema)(clientValidator_1.clientCreateServiceOrderSchema), clientAuditMiddleware_1.clientServiceOrderAuditMiddleware, (req, res) => controller.create(req, res));
// Comentar em OS
router.post('/:id/comments', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (0, providerValidator_1.validateSchema)(clientValidator_1.clientCommentSchema), clientAuditMiddleware_1.clientCommentsAuditMiddleware, (req, res) => controller.comment(req, res));
// Qualificar OS
router.post('/:id/qualification', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (0, providerValidator_1.validateSchema)(clientValidator_1.clientQualificationSchema), clientAuditMiddleware_1.clientQualificationAuditMiddleware, (req, res) => controller.qualify(req, res));
// Atualização de OS: restrita a customer_admin
router.put('/:id', clientAuthMiddleware_1.clientAuthMiddleware, (0, clientRbacMiddleware_1.requireClientRole)(['customer_admin']), (0, providerValidator_1.validateParams)(validateParamsSchema()), (0, providerValidator_1.validateSchema)(clientValidator_1.clientUpdateServiceOrderSchema), clientAuditMiddleware_1.clientServiceOrderAuditMiddleware, (req, res) => controller.update(req, res));
// Upload de anexos para OS do cliente (multipart/form-data com field "file")
router.post('/:id/attachments', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), upload.single('file'), clientAuditMiddleware_1.clientAttachmentAuditMiddleware, (req, res) => controller.uploadAttachment(req, res));
function validateParamsSchema() {
    // Reutiliza padrão de ID numérico positivo
    return {
        safeParse: (params) => {
            const id = Number(params.id);
            if (!params.id || isNaN(id) || id <= 0) {
                return { success: false, error: { errors: [{ path: ['id'], message: 'ID deve ser um número inteiro positivo' }] } };
            }
            return { success: true, data: { id } };
        }
    };
}
exports.default = router;
