"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupController_1 = require("../controllers/groupController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const groupValidator_1 = require("../validators/groupValidator");
const groupValidator_2 = require("../validators/groupValidator");
const router = (0, express_1.Router)();
const controller = new groupController_1.GroupController();
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
router.post('/providers/:providerId/groups', authMiddleware_1.authMiddleware, (0, groupValidator_1.validateParams)(groupValidator_2.providerIdParamSchema), (0, groupValidator_1.validateSchema)(groupValidator_2.createGroupSchema), (req, res) => controller.create(req, res));
router.get('/providers/:providerId/groups', authMiddleware_1.authMiddleware, (0, groupValidator_1.validateParams)(groupValidator_2.providerIdParamSchema), (req, res) => controller.list(req, res));
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
router.get('/providers/groups/:id', authMiddleware_1.authMiddleware, (0, groupValidator_1.validateParams)(groupValidator_2.groupIdParamSchema), (req, res) => controller.get(req, res));
router.patch('/providers/groups/:id', authMiddleware_1.authMiddleware, (0, groupValidator_1.validateParams)(groupValidator_2.groupIdParamSchema), (0, groupValidator_1.validateSchema)(groupValidator_2.updateGroupSchema), (req, res) => controller.update(req, res));
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
router.post('/providers/groups/:id/members', authMiddleware_1.authMiddleware, (0, groupValidator_1.validateParams)(groupValidator_2.groupIdParamSchema), (0, groupValidator_1.validateSchema)(groupValidator_2.addMembersSchema), (req, res) => controller.addMembers(req, res));
router.delete('/providers/groups/:id/members/:providerUserId', authMiddleware_1.authMiddleware, (0, groupValidator_1.validateParams)(groupValidator_2.groupIdParamSchema), (req, res) => controller.removeMember(req, res));
exports.default = router;
