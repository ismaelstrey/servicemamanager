"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userController_1 = require("../controllers/userController");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const userValidators_1 = require("../validators/userValidators");
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações de usuários (admin)
 */
const router = (0, express_1.Router)();
const controller = new userController_1.UserController();
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
router.get('/', authMiddleware_1.authMiddleware, (0, userValidators_1.validateQuery)(userValidators_1.listUsersSchema), (0, cacheMiddleware_1.listCacheMiddleware)(), (req, res) => controller.list(req, res));
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
router.get('/:id', authMiddleware_1.authMiddleware, (0, userValidators_1.validateParams)(userValidators_1.userIdParamSchema), (req, res) => controller.getById(req, res));
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
router.post('/', authMiddleware_1.authMiddleware, (0, userValidators_1.validateSchema)(userValidators_1.createUserSchema), (req, res) => controller.create(req, res));
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
router.put('/:id', authMiddleware_1.authMiddleware, (0, userValidators_1.validateParams)(userValidators_1.userIdParamSchema), (0, userValidators_1.validateSchema)(userValidators_1.updateUserSchema), (req, res) => controller.update(req, res));
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
router.post('/:id/disable', authMiddleware_1.authMiddleware, (0, userValidators_1.validateParams)(userValidators_1.userIdParamSchema), (req, res) => controller.disable(req, res));
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
router.post('/:id/enable', authMiddleware_1.authMiddleware, (0, userValidators_1.validateParams)(userValidators_1.userIdParamSchema), (req, res) => controller.enable(req, res));
exports.default = router;
