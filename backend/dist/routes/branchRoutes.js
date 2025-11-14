"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branchController_1 = require("../controllers/branchController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const branchValidator_1 = require("../validators/branchValidator");
const branchValidator_2 = require("../validators/branchValidator");
const router = (0, express_1.Router)();
const controller = new branchController_1.BranchController();
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
router.post('/providers/:providerId/branches', authMiddleware_1.authMiddleware, (0, branchValidator_1.validateParams)(branchValidator_2.providerIdParamSchema), (0, branchValidator_1.validateSchema)(branchValidator_2.createBranchSchema), (req, res) => controller.create(req, res));
router.get('/providers/:providerId/branches', authMiddleware_1.authMiddleware, (0, branchValidator_1.validateParams)(branchValidator_2.providerIdParamSchema), (req, res) => controller.list(req, res));
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
router.get('/providers/branches/:id', authMiddleware_1.authMiddleware, (0, branchValidator_1.validateParams)(branchValidator_2.branchIdParamSchema), (req, res) => controller.get(req, res));
router.patch('/providers/branches/:id', authMiddleware_1.authMiddleware, (0, branchValidator_1.validateParams)(branchValidator_2.branchIdParamSchema), (0, branchValidator_1.validateSchema)(branchValidator_2.updateBranchSchema), (req, res) => controller.update(req, res));
router.delete('/providers/branches/:id', authMiddleware_1.authMiddleware, (0, branchValidator_1.validateParams)(branchValidator_2.branchIdParamSchema), (req, res) => controller.delete(req, res));
exports.default = router;
