import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { RoutineController } from '../controllers/routineController'
import { validateSchema, validateParams, validateQuery } from '../validators/routineValidator'
import { createRoutineSchema, updateRoutineSchema, routineIdParamSchema, listRoutinesSchema } from '../validators/routineValidator'

const router = Router()
const controller = new RoutineController()

/**
 * @swagger
 * tags:
 *   name: Routines
 *   description: Rotinas de criação automática
 */

/**
 * @swagger
 * /api/routines:
 *   post:
 *     summary: Criar rotina
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar rotinas
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 */
router.post('/routines', authMiddleware, validateSchema(createRoutineSchema), (req, res) => controller.create(req as any, res))
router.get('/routines', authMiddleware, validateQuery(listRoutinesSchema), (req, res) => controller.list(req as any, res))

/**
 * @swagger
 * /api/routines/{id}:
 *   get:
 *     summary: Detalhar rotina
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     summary: Atualizar rotina
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 */
router.get('/routines/:id', authMiddleware, validateParams(routineIdParamSchema), (req, res) => controller.getById(req as any, res))
router.patch('/routines/:id', authMiddleware, validateParams(routineIdParamSchema), validateSchema(updateRoutineSchema), (req, res) => controller.update(req as any, res))

/**
 * @swagger
 * /api/routines/{id}/test-run:
 *   post:
 *     summary: Executar rotina uma vez (teste)
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 */
router.post('/routines/:id/test-run', authMiddleware, validateParams(routineIdParamSchema), (req, res) => controller.testRun(req as any, res))

/**
 * @swagger
 * /api/routines/{id}/logs:
 *   get:
 *     summary: Listar logs da rotina
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 */
router.get('/routines/:id/logs', authMiddleware, validateParams(routineIdParamSchema), (req, res) => controller.logs(req as any, res))

export default router