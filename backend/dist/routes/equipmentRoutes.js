"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const equipmentController_1 = require("../controllers/equipmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const equipmentValidator_1 = require("../validators/equipmentValidator");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = (0, express_1.Router)();
const controller = new equipmentController_1.EquipmentController();
// Protegidas: exigem autenticação com cache para consultas
router.get('/:providerId/equipments', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.providerIdParamSchema), (0, equipmentValidator_1.validateQuery)(equipmentValidator_1.listEquipmentsSchema), (0, cacheMiddleware_1.listCacheMiddleware)(), (req, res) => controller.list(req, res));
router.post('/:providerId/equipments', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.providerIdParamSchema), (0, equipmentValidator_1.validateSchema)(equipmentValidator_1.createEquipmentSchema), (req, res) => controller.create(req, res));
router.get('/:providerId/equipments/stats', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.providerIdParamSchema), (0, cacheMiddleware_1.statsCacheMiddleware)(), (req, res) => controller.getStats(req, res));
// CRUD por ID de equipamento com cache para consultas
router.get('/equipments/:id', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.equipmentIdParamSchema), (0, cacheMiddleware_1.equipmentCacheMiddleware)(), (req, res) => controller.getById(req, res));
router.get('/equipments/:id/history', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.equipmentIdParamSchema), (0, equipmentValidator_1.validateQuery)(equipmentValidator_1.historyQuerySchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 120, keyPrefix: 'history', varyBy: ['userId', 'providerId', 'params.id', 'query.page', 'query.limit'] }), (req, res) => controller.history(req, res));
router.put('/equipments/:id', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.equipmentIdParamSchema), (0, equipmentValidator_1.validateSchema)(equipmentValidator_1.updateEquipmentSchema), (req, res) => controller.update(req, res));
router.delete('/equipments/:id', authMiddleware_1.authMiddleware, (0, equipmentValidator_1.validateParams)(equipmentValidator_1.equipmentIdParamSchema), (req, res) => controller.delete(req, res));
exports.default = router;
