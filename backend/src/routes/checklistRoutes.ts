import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { ChecklistController } from '../controllers/checklistController'
import { validateSchema, validateParams } from '../validators/checklistValidator'
import { createChecklistTemplateSchema, updateChecklistTemplateSchema, templateIdParamSchema, createChecklistLinkSchema, linkIdParamSchema, updateChecklistItemSchema } from '../validators/checklistValidator'

const router = Router()
const controller = new ChecklistController()

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
router.post('/checklists/templates', authMiddleware, validateSchema(createChecklistTemplateSchema), (req, res) => controller.createTemplate(req as any, res))

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
router.get('/checklists/templates/:id', authMiddleware, validateParams(templateIdParamSchema), (req, res) => controller.getTemplate(req as any, res))
router.patch('/checklists/templates/:id', authMiddleware, validateParams(templateIdParamSchema), validateSchema(updateChecklistTemplateSchema), (req, res) => controller.updateTemplate(req as any, res))
router.delete('/checklists/templates/:id', authMiddleware, validateParams(templateIdParamSchema), (req, res) => controller.deleteTemplate(req as any, res))

/**
 * @swagger
 * /api/checklists/link:
 *   post:
 *     summary: Vincular template a um recurso
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 */
router.post('/checklists/link', authMiddleware, validateSchema(createChecklistLinkSchema), (req, res) => controller.link(req as any, res))

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
router.get('/checklists/:linkId', authMiddleware, validateParams(linkIdParamSchema), (req, res) => controller.getLink(req as any, res))
router.delete('/checklists/:linkId', authMiddleware, validateParams(linkIdParamSchema), (req, res) => controller.deleteLink(req as any, res))

/**
 * @swagger
 * /api/checklists/{linkId}/items/{itemId}:
 *   patch:
 *     summary: Atualizar item do checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/checklists/:linkId/items/:itemId', authMiddleware, validateParams(linkIdParamSchema), validateSchema(updateChecklistItemSchema), (req, res) => controller.updateItem(req as any, res))

export default router