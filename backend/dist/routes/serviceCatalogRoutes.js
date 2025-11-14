"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceCatalogController_1 = require("../controllers/serviceCatalogController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const serviceCatalogValidator_1 = require("../validators/serviceCatalogValidator");
const serviceCatalogValidator_2 = require("../validators/serviceCatalogValidator");
const router = (0, express_1.Router)();
const controller = new serviceCatalogController_1.ServiceCatalogController();
/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Catálogo de serviços do provedor
 */
/**
 * @swagger
 * /api/providers/{providerId}/services:
 *   post:
 *     summary: Criar serviço
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar serviços
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 */
router.post('/providers/:providerId/services', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.providerIdParamSchema), (0, serviceCatalogValidator_1.validateSchema)(serviceCatalogValidator_2.createServiceSchema), (req, res) => controller.createService(req, res));
router.get('/providers/:providerId/services', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.providerIdParamSchema), (0, serviceCatalogValidator_1.validateQuery)(serviceCatalogValidator_2.listServicesSchema), (req, res) => controller.listServices(req, res));
/**
 * @swagger
 * /api/providers/services/{id}:
 *   get:
 *     summary: Detalhar serviço
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     summary: Atualizar serviço
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Remover serviço
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 */
router.get('/providers/services/:id', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.serviceIdParamSchema), (req, res) => controller.getService(req, res));
router.patch('/providers/services/:id', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.serviceIdParamSchema), (0, serviceCatalogValidator_1.validateSchema)(serviceCatalogValidator_2.updateServiceSchema), (req, res) => controller.updateService(req, res));
router.delete('/providers/services/:id', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.serviceIdParamSchema), (req, res) => controller.deleteService(req, res));
/**
 * @swagger
 * tags:
 *   name: Credentials
 *   description: Credenciais de acesso aos serviços
 */
/**
 * @swagger
 * /api/providers/services/{serviceId}/credentials:
 *   post:
 *     summary: Criar credencial
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar credenciais do serviço
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 */
router.post('/providers/services/:serviceId/credentials', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.serviceIdParamSchema), (0, serviceCatalogValidator_1.validateSchema)(serviceCatalogValidator_2.createCredentialSchema), (req, res) => controller.createCredential(req, res));
router.get('/providers/services/:serviceId/credentials', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.serviceIdParamSchema), (req, res) => controller.listCredentials(req, res));
/**
 * @swagger
 * /api/providers/credentials/{id}:
 *   get:
 *     summary: Detalhar credencial
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     summary: Atualizar credencial
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Remover credencial
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 */
router.get('/providers/credentials/:id', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.credentialIdParamSchema), (req, res) => controller.getCredential(req, res));
router.patch('/providers/credentials/:id', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.credentialIdParamSchema), (0, serviceCatalogValidator_1.validateSchema)(serviceCatalogValidator_2.updateCredentialSchema), (req, res) => controller.updateCredential(req, res));
router.delete('/providers/credentials/:id', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.credentialIdParamSchema), (req, res) => controller.deleteCredential(req, res));
/**
 * @swagger
 * /api/providers/credentials/{id}/access/users:
 *   post:
 *     summary: Definir usuários com acesso à credencial (CUSTOM)
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 * /api/providers/credentials/{id}/access/groups:
 *   post:
 *     summary: Definir grupos com acesso à credencial (CUSTOM)
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 * /api/providers/credentials/{id}/access/users/{providerUserId}:
 *   delete:
 *     summary: Remover usuário do acesso
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 * /api/providers/credentials/{id}/access/groups/{groupId}:
 *   delete:
 *     summary: Remover grupo do acesso
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 */
router.post('/providers/credentials/:id/access/users', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.credentialIdParamSchema), (0, serviceCatalogValidator_1.validateSchema)(serviceCatalogValidator_2.setCredentialUsersSchema), (req, res) => controller.setCredentialUsers(req, res));
router.post('/providers/credentials/:id/access/groups', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.credentialIdParamSchema), (0, serviceCatalogValidator_1.validateSchema)(serviceCatalogValidator_2.setCredentialGroupsSchema), (req, res) => controller.setCredentialGroups(req, res));
router.delete('/providers/credentials/:id/access/users/:providerUserId', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.credentialIdParamSchema), (req, res) => controller.removeCredentialUser(req, res));
router.delete('/providers/credentials/:id/access/groups/:groupId', authMiddleware_1.authMiddleware, (0, serviceCatalogValidator_1.validateParams)(serviceCatalogValidator_2.credentialIdParamSchema), (req, res) => controller.removeCredentialGroup(req, res));
exports.default = router;
