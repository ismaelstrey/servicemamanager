"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientAuthMiddleware_1 = require("../middlewares/clientAuthMiddleware");
const clientServiceCatalogController_1 = require("../controllers/clientServiceCatalogController");
const router = (0, express_1.Router)();
const controller = new clientServiceCatalogController_1.ClientServiceCatalogController();
/**
 * @swagger
 * tags:
 *   name: Client Services
 *   description: Serviços e credenciais visíveis para clientes
 */
/**
 * @swagger
 * /api/client/services:
 *   get:
 *     summary: Listar serviços ativos do provedor do cliente
 *     tags: [Client Services]
 */
router.get('/services', clientAuthMiddleware_1.clientAuthMiddleware, (req, res) => controller.listServices(req, res));
/**
 * @swagger
 * /api/client/services/{serviceId}/credentials:
 *   get:
 *     summary: Listar credenciais visíveis para o cliente
 *     tags: [Client Services]
 */
router.get('/services/:serviceId/credentials', clientAuthMiddleware_1.clientAuthMiddleware, (req, res) => controller.listCredentials(req, res));
exports.default = router;
