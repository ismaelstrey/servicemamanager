"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const equipmentController_1 = require("../controllers/equipmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const equipmentValidator_1 = require("../validators/equipmentValidator");
const router = (0, express_1.Router)();
const controller = new equipmentController_1.EquipmentController();
// Protegidas: exigem autenticação
router.get('/:providerId/equipments', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.providerIdParamSchema), (0, equipmentValidator_1.validateQuery)(equipmentValidator_1.listEquipmentsSchema), (req, res) => controller.list(req, res));
router.post('/:providerId/equipments', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.providerIdParamSchema), (0, equipmentValidator_1.validateSchema)(equipmentValidator_1.createEquipmentSchema), (req, res) => controller.create(req, res));
router.get('/:providerId/equipments/stats', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.providerIdParamSchema), (req, res) => controller.getStats(req, res));
// CRUD por ID de equipamento
router.get('/equipments/:id', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.equipmentIdParamSchema), (req, res) => controller.getById(req, res));
router.put('/equipments/:id', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.equipmentIdParamSchema), (0, equipmentValidator_1.validateSchema)(equipmentValidator_1.updateEquipmentSchema), (req, res) => controller.update(req, res));
router.delete('/equipments/:id', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.equipmentIdParamSchema), (req, res) => controller.delete(req, res));
exports.default = router;
