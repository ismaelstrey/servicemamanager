import { Router } from 'express'
import { GroupController } from '../controllers/groupController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateSchema, validateParams } from '../validators/groupValidator'
import { providerIdParamSchema, groupIdParamSchema, createGroupSchema, updateGroupSchema, addMembersSchema } from '../validators/groupValidator'

const router = Router()
const controller = new GroupController()

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Grupos de usuários do provedor
 */
/**
 * @swagger
 * /api/providers/{providerId}/groups:
 *   post:
 *     summary: Criar grupo
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar grupos
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.post('/providers/:providerId/groups', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createGroupSchema), (req, res) => controller.create(req as any, res))
router.get('/providers/:providerId/groups', authMiddleware, validateParams(providerIdParamSchema), (req, res) => controller.list(req as any, res))
/**
 * @swagger
 * /api/providers/groups/{id}:
 *   get:
 *     summary: Detalhar grupo
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     summary: Atualizar grupo
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.get('/providers/groups/:id', authMiddleware, validateParams(groupIdParamSchema), (req, res) => controller.get(req as any, res))
router.patch('/providers/groups/:id', authMiddleware, validateParams(groupIdParamSchema), validateSchema(updateGroupSchema), (req, res) => controller.update(req as any, res))
/**
 * @swagger
 * /api/providers/groups/{id}/members:
 *   post:
 *     summary: Definir membros do grupo
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 * /api/providers/groups/{id}/members/{providerUserId}:
 *   delete:
 *     summary: Remover membro do grupo
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.post('/providers/groups/:id/members', authMiddleware, validateParams(groupIdParamSchema), validateSchema(addMembersSchema), (req, res) => controller.addMembers(req as any, res))
router.delete('/providers/groups/:id/members/:providerUserId', authMiddleware, validateParams(groupIdParamSchema), (req, res) => controller.removeMember(req as any, res))

export default router
