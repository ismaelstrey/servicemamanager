"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceOrderController_1 = require("../controllers/serviceOrderController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const serviceOrderValidator_1 = require("../validators/serviceOrderValidator");
const router = (0, express_1.Router)();
const controller = new serviceOrderController_1.ServiceOrderController();
// Service order statistics
router.get('/stats', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateQuery)(serviceOrderValidator_1.serviceOrderStatsSchema), (req, res) => controller.getStats(req, res));
// List service orders
router.get('/', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateQuery)(serviceOrderValidator_1.listServiceOrdersSchema), (req, res) => controller.getAll(req, res));
// Get service order by ID
router.get('/:id', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (req, res) => controller.getById(req, res));
// Create service order
router.post('/', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateSchema)(serviceOrderValidator_1.createServiceOrderSchema), (req, res) => controller.create(req, res));
// Update service order
router.put('/:id', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (0, serviceOrderValidator_1.validateSchema)(serviceOrderValidator_1.updateServiceOrderSchema), (req, res) => controller.update(req, res));
// Update service order status
router.patch('/:id/status', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (0, serviceOrderValidator_1.validateSchema)(serviceOrderValidator_1.updateServiceOrderStatusSchema), (req, res) => controller.updateStatus(req, res));
// Delete service order
router.delete('/:id', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (req, res) => controller.delete(req, res));
exports.default = router;
