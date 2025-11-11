"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const customerController_1 = require("../controllers/customerController");
const providerValidator_1 = require("../validators/providerValidator");
const customerValidator_1 = require("../validators/customerValidator");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Listagem de clientes com busca e paginação
 */
/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Lista clientes com busca
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
  *       - in: query
  *         name: search
  *         schema:
  *           type: string
  *           maxLength: 255
  *       - in: query
  *         name: page
  *         schema:
  *           type: integer
  *           minimum: 1
  *           default: 1
  *       - in: query
  *         name: limit
  *         schema:
  *           type: integer
  *           minimum: 1
  *           maximum: 100
  *           default: 10
  *       - in: query
  *         name: providerId
  *         schema:
  *           type: integer
  *           minimum: 1
  *         description: ID do provedor (opcional quando o token não possui providerId)
 *     responses:
 *       200:
 *         description: Lista paginada de clientes
 */
// Lista de clientes com busca e paginação
router.get('/', authMiddleware_1.authMiddleware, (0, providerValidator_1.validateQuery)(customerValidator_1.listCustomersSchema), (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 180, keyPrefix: 'customers:list', varyBy: ['userId', 'providerId', 'query.page', 'query.limit', 'query.search', 'query.providerId'] }), (req, res) => customerController_1.customerController.list(req, res));
exports.default = router;
