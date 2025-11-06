import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { customerController } from '../controllers/customerController';
import { validateQuery } from '../validators/providerValidator';
import { listCustomersSchema } from '../validators/customerValidator';
import { listCacheMiddleware, cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();

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
router.get(
  '/',
  authMiddleware,
  validateQuery(listCustomersSchema),
  cacheMiddleware({ ttl: 180, keyPrefix: 'customers:list', varyBy: ['userId', 'providerId', 'query.page', 'query.limit', 'query.search', 'query.providerId'] }),
  (req, res) => customerController.list(req as any, res)
);

export default router;