import { Router } from 'express'
import { ServiceCatalogController } from '../controllers/serviceCatalogController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateSchema, validateParams, validateQuery } from '../validators/serviceCatalogValidator'
import { providerIdParamSchema, serviceIdParamSchema, credentialIdParamSchema, createServiceSchema, updateServiceSchema, listServicesSchema, createCredentialSchema, updateCredentialSchema, setCredentialUsersSchema, setCredentialGroupsSchema } from '../validators/serviceCatalogValidator'

const router = Router()
const controller = new ServiceCatalogController()

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
router.post('/providers/:providerId/services', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createServiceSchema), (req, res) => controller.createService(req as any, res))
router.get('/providers/:providerId/services', authMiddleware, validateParams(providerIdParamSchema), validateQuery(listServicesSchema), (req, res) => controller.listServices(req as any, res))
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
router.get('/providers/services/:id', authMiddleware, validateParams(serviceIdParamSchema), (req, res) => controller.getService(req as any, res))
router.patch('/providers/services/:id', authMiddleware, validateParams(serviceIdParamSchema), validateSchema(updateServiceSchema), (req, res) => controller.updateService(req as any, res))
router.delete('/providers/services/:id', authMiddleware, validateParams(serviceIdParamSchema), (req, res) => controller.deleteService(req as any, res))

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
router.post('/providers/services/:serviceId/credentials', authMiddleware, validateParams(serviceIdParamSchema), validateSchema(createCredentialSchema), (req, res) => controller.createCredential(req as any, res))
router.get('/providers/services/:serviceId/credentials', authMiddleware, validateParams(serviceIdParamSchema), (req, res) => controller.listCredentials(req as any, res))
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
router.get('/providers/credentials/:id', authMiddleware, validateParams(credentialIdParamSchema), (req, res) => controller.getCredential(req as any, res))
router.patch('/providers/credentials/:id', authMiddleware, validateParams(credentialIdParamSchema), validateSchema(updateCredentialSchema), (req, res) => controller.updateCredential(req as any, res))
router.delete('/providers/credentials/:id', authMiddleware, validateParams(credentialIdParamSchema), (req, res) => controller.deleteCredential(req as any, res))
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
router.post('/providers/credentials/:id/access/users', authMiddleware, validateParams(credentialIdParamSchema), validateSchema(setCredentialUsersSchema), (req, res) => controller.setCredentialUsers(req as any, res))
router.post('/providers/credentials/:id/access/groups', authMiddleware, validateParams(credentialIdParamSchema), validateSchema(setCredentialGroupsSchema), (req, res) => controller.setCredentialGroups(req as any, res))
router.delete('/providers/credentials/:id/access/users/:providerUserId', authMiddleware, validateParams(credentialIdParamSchema), (req, res) => controller.removeCredentialUser(req as any, res))
router.delete('/providers/credentials/:id/access/groups/:groupId', authMiddleware, validateParams(credentialIdParamSchema), (req, res) => controller.removeCredentialGroup(req as any, res))

export default router
