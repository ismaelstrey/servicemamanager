import { Router } from 'express';
import { CommentController } from '../controllers/commentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { auditMiddleware } from '../middleware/auditMiddleware';
import { createResourceRateLimit } from '../middlewares/rateLimitMiddleware';
import { listCacheMiddleware, cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const commentController = new CommentController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do comentário
 *         content:
 *           type: string
 *           description: Conteúdo do comentário
 *         resourceType:
 *           type: string
 *           enum: [ticket, service_order]
 *           description: Tipo de recurso (ticket ou ordem de serviço)
 *         resourceId:
 *           type: integer
 *           description: ID do recurso relacionado
 *         isInternal:
 *           type: boolean
 *           description: Se o comentário é interno ou visível ao cliente
 *         isEdited:
 *           type: boolean
 *           description: Se o comentário foi editado
 *         editedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última edição
 *         userId:
 *           type: integer
 *           description: ID do usuário que criou o comentário
 *         providerId:
 *           type: integer
 *           description: ID do provedor
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         provider:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *     CreateCommentRequest:
 *       type: object
 *       required:
 *         - content
 *         - resourceType
 *         - resourceId
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           description: Conteúdo do comentário
 *         resourceType:
 *           type: string
 *           enum: [ticket, service_order]
 *           description: Tipo de recurso
 *         resourceId:
 *           type: integer
 *           minimum: 1
 *           description: ID do recurso
 *         isInternal:
 *           type: boolean
 *           default: false
 *           description: Se o comentário é interno
 *     UpdateCommentRequest:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           description: Novo conteúdo do comentário
 *         isInternal:
 *           type: boolean
 *           description: Se o comentário é interno
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Criar novo comentário
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *     responses:
 *       201:
 *         description: Comentário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', 
  createResourceRateLimit,
  auditMiddleware('comments'),
  commentController.createComment.bind(commentController)
);

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Listar comentários com filtros
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [ticket, service_order]
 *         description: Filtrar por tipo de recurso
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do recurso
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: isInternal
 *         schema:
 *           type: boolean
 *         description: Filtrar por comentários internos
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de comentários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', listCacheMiddleware(), commentController.getComments.bind(commentController));

/**
 * @swagger
 * /api/comments/recent:
 *   get:
 *     summary: Obter comentários recentes
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número de comentários recentes
 *     responses:
 *       200:
 *         description: Lista de comentários recentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 */
router.get('/recent', cacheMiddleware({ ttl: 300, keyPrefix: 'comments:recent' }), commentController.getRecentComments.bind(commentController));

/**
 * @swagger
 * /api/comments/{resourceType}/{resourceId}:
 *   get:
 *     summary: Obter comentários de um recurso específico
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ticket, service_order]
 *         description: Tipo de recurso
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do recurso
 *       - in: query
 *         name: includeInternal
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir comentários internos
 *     responses:
 *       200:
 *         description: Lista de comentários do recurso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 */
router.get('/:resourceType/:resourceId', cacheMiddleware({ ttl: 600, keyPrefix: 'comments:resource', varyBy: ['resourceType', 'resourceId'] }), commentController.getCommentsByResource.bind(commentController));

/**
 * @swagger
 * /api/comments/{resourceType}/{resourceId}/count:
 *   get:
 *     summary: Obter contagem de comentários de um recurso
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ticket, service_order]
 *         description: Tipo de recurso
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do recurso
 *     responses:
 *       200:
 *         description: Contagem de comentários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 */
router.get('/:resourceType/:resourceId/count', commentController.getCommentCount.bind(commentController));

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Obter comentário por ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Comentário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comentário não encontrado
 */
router.get('/:id', cacheMiddleware({ ttl: 1800, keyPrefix: 'comments:detail', varyBy: ['id'] }), commentController.getCommentById.bind(commentController));

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Atualizar comentário
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do comentário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       200:
 *         description: Comentário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Não autorizado a editar este comentário
 *       404:
 *         description: Comentário não encontrado
 */
router.put('/:id', 
  auditMiddleware('comments'),
  commentController.updateComment.bind(commentController)
);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Excluir comentário
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Comentário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Não autorizado a excluir este comentário
 *       404:
 *         description: Comentário não encontrado
 */
router.delete('/:id', 
  auditMiddleware('comments'),
  commentController.deleteComment.bind(commentController)
);

export default router;