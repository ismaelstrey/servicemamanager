import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { UserController } from '../controllers/userController'
import { listCacheMiddleware } from '../middleware/cacheMiddleware'
import { validateQuery, listUsersSchema, validateParams, userIdParamSchema, validateSchema, createUserSchema, updateUserSchema } from '../validators/userValidators'

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações de usuários (admin)
 */
const router = Router()
const controller = new UserController()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista paginada de usuários
 */
router.get('/', authMiddleware, validateQuery(listUsersSchema), listCacheMiddleware(), (req, res) => controller.list(req as any, res))
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Detalha usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do usuário
 */
router.get('/:id', authMiddleware, validateParams(userIdParamSchema), (req, res) => controller.getById(req as any, res))
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado
 */
router.post('/', authMiddleware, validateSchema(createUserSchema), (req, res) => controller.create(req as any, res))
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 */
router.put('/:id', authMiddleware, validateParams(userIdParamSchema), validateSchema(updateUserSchema), (req, res) => controller.update(req as any, res))
/**
 * @swagger
 * /api/users/{id}/disable:
 *   post:
 *     summary: Desativa usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário desativado
 */
router.post('/:id/disable', authMiddleware, validateParams(userIdParamSchema), (req, res) => controller.disable(req as any, res))
/**
 * @swagger
 * /api/users/{id}/enable:
 *   post:
 *     summary: Reativa usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário reativado
 */
router.post('/:id/enable', authMiddleware, validateParams(userIdParamSchema), (req, res) => controller.enable(req as any, res))

export default router
