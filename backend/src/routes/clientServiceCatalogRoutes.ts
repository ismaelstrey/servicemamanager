import { Router } from 'express'
import { clientAuthMiddleware } from '../middlewares/clientAuthMiddleware'
import { ClientServiceCatalogController } from '../controllers/clientServiceCatalogController'

const router = Router()
const controller = new ClientServiceCatalogController()

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
router.get('/services', clientAuthMiddleware, (req, res) => controller.listServices(req as any, res))
/**
 * @swagger
 * /api/client/services/{serviceId}/credentials:
 *   get:
 *     summary: Listar credenciais visíveis para o cliente
 *     tags: [Client Services]
 */
router.get('/services/:serviceId/credentials', clientAuthMiddleware, (req, res) => controller.listCredentials(req as any, res))

export default router