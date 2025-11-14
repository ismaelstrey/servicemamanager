"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const routineController_1 = require("../controllers/routineController");
const routineValidator_1 = require("../validators/routineValidator");
const routineValidator_2 = require("../validators/routineValidator");
const router = (0, express_1.Router)();
const controller = new routineController_1.RoutineController();
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
router.post('/routines', authMiddleware_1.authMiddleware, (0, routineValidator_1.validateSchema)(routineValidator_2.createRoutineSchema), (req, res) => controller.create(req, res));
router.get('/routines', authMiddleware_1.authMiddleware, (0, routineValidator_1.validateQuery)(routineValidator_2.listRoutinesSchema), (req, res) => controller.list(req, res));
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
router.get('/routines/:id', authMiddleware_1.authMiddleware, (0, routineValidator_1.validateParams)(routineValidator_2.routineIdParamSchema), (req, res) => controller.getById(req, res));
router.patch('/routines/:id', authMiddleware_1.authMiddleware, (0, routineValidator_1.validateParams)(routineValidator_2.routineIdParamSchema), (0, routineValidator_1.validateSchema)(routineValidator_2.updateRoutineSchema), (req, res) => controller.update(req, res));
/**
 * @swagger
 * /api/routines/{id}/test-run:
 *   post:
 *     summary: Executar rotina uma vez (teste)
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 */
router.post('/routines/:id/test-run', authMiddleware_1.authMiddleware, (0, routineValidator_1.validateParams)(routineValidator_2.routineIdParamSchema), (req, res) => controller.testRun(req, res));
/**
 * @swagger
 * /api/routines/{id}/logs:
 *   get:
 *     summary: Listar logs da rotina
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 */
router.get('/routines/:id/logs', authMiddleware_1.authMiddleware, (0, routineValidator_1.validateParams)(routineValidator_2.routineIdParamSchema), (req, res) => controller.logs(req, res));
exports.default = router;
