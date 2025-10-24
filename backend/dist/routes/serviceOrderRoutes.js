"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceOrderController_1 = require("../controllers/serviceOrderController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const serviceOrderValidator_1 = require("../validators/serviceOrderValidator");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = (0, express_1.Router)();
const controller = new serviceOrderController_1.ServiceOrderController();
// Service order statistics with cache
router.get('/stats', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateQuery)(serviceOrderValidator_1.serviceOrderStatsSchema), (0, cacheMiddleware_1.statsCacheMiddleware)(), (req, res) => controller.getStats(req, res));
// Kanban board for service orders
router.get('/kanban', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateQuery)(serviceOrderValidator_1.serviceOrderStatsSchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 60, keyPrefix: 'kanban', varyBy: ['userId', 'providerId'] }), (req, res) => controller.kanban(req, res));
// List service orders with cache
router.get('/', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateQuery)(serviceOrderValidator_1.listServiceOrdersSchema), (0, cacheMiddleware_1.listCacheMiddleware)(), (req, res) => controller.getAll(req, res));
// Get service order by ID with cache
router.get('/:id', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (0, cacheMiddleware_1.serviceOrderCacheMiddleware)(), (req, res) => controller.getById(req, res));
// Get service order history by ID with cache
router.get('/:id/history', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (0, serviceOrderValidator_1.validateQuery)(serviceOrderValidator_1.historyQuerySchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 120, keyPrefix: 'history', varyBy: ['userId', 'providerId', 'params.id', 'query.page', 'query.limit'] }), (req, res) => controller.history(req, res));
// Create service order
router.post('/', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateSchema)(serviceOrderValidator_1.createServiceOrderSchema), (req, res) => controller.create(req, res));
// Update service order
router.put('/:id', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (0, serviceOrderValidator_1.validateSchema)(serviceOrderValidator_1.updateServiceOrderSchema), (req, res) => controller.update(req, res));
// Update service order status
router.patch('/:id/status', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (0, serviceOrderValidator_1.validateSchema)(serviceOrderValidator_1.updateServiceOrderStatusSchema), (req, res) => controller.updateStatus(req, res));
// Delete service order
router.delete('/:id', authMiddleware_1.authMiddleware, (0, serviceOrderValidator_1.validateParams)(serviceOrderValidator_1.serviceOrderIdParamSchema), (req, res) => controller.delete(req, res));
exports.default = router;
