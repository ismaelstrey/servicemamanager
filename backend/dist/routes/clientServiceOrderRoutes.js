"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientServiceOrderController_1 = require("../controllers/clientServiceOrderController");
const clientAuthMiddleware_1 = require("../middlewares/clientAuthMiddleware");
const providerValidator_1 = require("../validators/providerValidator");
const clientValidator_1 = require("../validators/clientValidator");
const router = (0, express_1.Router)();
const controller = new clientServiceOrderController_1.ClientServiceOrderController();
// Listar OS do cliente
router.get('/', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateQuery)(clientValidator_1.clientListServiceOrdersSchema), (req, res) => controller.list(req, res));
// Detalhar OS do cliente
router.get('/:id', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (req, res) => controller.getById(req, res));
// Criar OS
router.post('/', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateSchema)(clientValidator_1.clientCreateServiceOrderSchema), (req, res) => controller.create(req, res));
// Comentar em OS
router.post('/:id/comments', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (0, providerValidator_1.validateSchema)(clientValidator_1.clientCommentSchema), (req, res) => controller.comment(req, res));
// Qualificar OS
router.post('/:id/qualification', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (0, providerValidator_1.validateSchema)(clientValidator_1.clientQualificationSchema), (req, res) => controller.qualify(req, res));
router.put('/:id', clientAuthMiddleware_1.clientAuthMiddleware, (0, providerValidator_1.validateParams)(validateParamsSchema()), (0, providerValidator_1.validateSchema)(clientValidator_1.clientUpdateServiceOrderSchema), (req, res) => controller.update(req, res));
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
