"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const checklistController_1 = require("../controllers/checklistController");
const checklistValidator_1 = require("../validators/checklistValidator");
const checklistValidator_2 = require("../validators/checklistValidator");
const router = (0, express_1.Router)();
const controller = new checklistController_1.ChecklistController();
/**
 * @swagger
 * tags:
 *   name: Checklists
 *   description: Gestão de checklists
 */
/**
 * @swagger
 * /api/checklists/templates:
 *   post:
 *     summary: Criar template de checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 */
router.post('/checklists/templates', authMiddleware_1.authMiddleware, (0, checklistValidator_1.validateSchema)(checklistValidator_2.createChecklistTemplateSchema), (req, res) => controller.createTemplate(req, res));
/**
 * @swagger
 * /api/checklists/templates/{id}:
 *   get:
 *     summary: Detalhar template de checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     summary: Atualizar template de checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Remover template de checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 */
router.get('/checklists/templates/:id', authMiddleware_1.authMiddleware, (0, checklistValidator_1.validateParams)(checklistValidator_2.templateIdParamSchema), (req, res) => controller.getTemplate(req, res));
router.patch('/checklists/templates/:id', authMiddleware_1.authMiddleware, (0, checklistValidator_1.validateParams)(checklistValidator_2.templateIdParamSchema), (0, checklistValidator_1.validateSchema)(checklistValidator_2.updateChecklistTemplateSchema), (req, res) => controller.updateTemplate(req, res));
router.delete('/checklists/templates/:id', authMiddleware_1.authMiddleware, (0, checklistValidator_1.validateParams)(checklistValidator_2.templateIdParamSchema), (req, res) => controller.deleteTemplate(req, res));
/**
 * @swagger
 * /api/checklists/link:
 *   post:
 *     summary: Vincular template a um recurso
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 */
router.post('/checklists/link', authMiddleware_1.authMiddleware, (0, checklistValidator_1.validateSchema)(checklistValidator_2.createChecklistLinkSchema), (req, res) => controller.link(req, res));
/**
 * @swagger
 * /api/checklists/{linkId}:
 *   get:
 *     summary: Detalhar vínculo de checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Remover vínculo de checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 */
router.get('/checklists/:linkId', authMiddleware_1.authMiddleware, (0, checklistValidator_1.validateParams)(checklistValidator_2.linkIdParamSchema), (req, res) => controller.getLink(req, res));
router.delete('/checklists/:linkId', authMiddleware_1.authMiddleware, (0, checklistValidator_1.validateParams)(checklistValidator_2.linkIdParamSchema), (req, res) => controller.deleteLink(req, res));
/**
 * @swagger
 * /api/checklists/{linkId}/items/{itemId}:
 *   patch:
 *     summary: Atualizar item do checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/checklists/:linkId/items/:itemId', authMiddleware_1.authMiddleware, (0, checklistValidator_1.validateParams)(checklistValidator_2.linkIdParamSchema), (0, checklistValidator_1.validateSchema)(checklistValidator_2.updateChecklistItemSchema), (req, res) => controller.updateItem(req, res));
exports.default = router;
