import { Router } from 'express'
import { BranchController } from '../controllers/branchController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateSchema, validateParams } from '../validators/branchValidator'
import { providerIdParamSchema, createBranchSchema, updateBranchSchema, branchIdParamSchema } from '../validators/branchValidator'

const router = Router()
const controller = new BranchController()

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Filiais do provedor
 */
/**
 * @swagger
 * /api/providers/{providerId}/branches:
 *   post:
 *     summary: Criar filial
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar filiais
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 */
router.post('/providers/:providerId/branches', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createBranchSchema), (req, res) => controller.create(req as any, res))
router.get('/providers/:providerId/branches', authMiddleware, validateParams(providerIdParamSchema), (req, res) => controller.list(req as any, res))
/**
 * @swagger
 * /api/providers/branches/{id}:
 *   get:
 *     summary: Detalhar filial
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     summary: Atualizar filial
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Remover filial
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 */
router.get('/providers/branches/:id', authMiddleware, validateParams(branchIdParamSchema), (req, res) => controller.get(req as any, res))
router.patch('/providers/branches/:id', authMiddleware, validateParams(branchIdParamSchema), validateSchema(updateBranchSchema), (req, res) => controller.update(req as any, res))
router.delete('/providers/branches/:id', authMiddleware, validateParams(branchIdParamSchema), (req, res) => controller.delete(req as any, res))

export default router
