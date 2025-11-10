import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateQuery, reportFilterSchema, exportReportSchema } from '../validators/reportValidator';
import { statsCacheMiddleware } from '../middleware/cacheMiddleware';

// Comentário: Rotas para relatórios, protegidas por JWT, com validação de query e cache em sumário

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Endpoints de relatórios e exportação
 */

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Sumário de relatórios (KPIs)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sumário retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totals:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: integer
 *                     openTickets:
 *                       type: integer
 *                     serviceOrders:
 *                       type: integer
 *                     pendingServiceOrders:
 *                       type: integer
 *                 byStatus:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     serviceOrders:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                 byPriority:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     serviceOrders:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                 kpis:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       value:
 *                         type: integer
 *             examples:
 *               default:
 *                 value:
 *                   totals:
 *                     tickets: 120
 *                     openTickets: 35
 *                     serviceOrders: 80
 *                     pendingServiceOrders: 22
 *                   byStatus:
 *                     tickets:
 *                       open: 35
 *                       in_progress: 20
 *                       resolved: 40
 *                       closed: 15
 *                     serviceOrders:
 *                       pending: 22
 *                       in_progress: 30
 *                       completed: 25
 *                       cancelled: 3
 *                   byPriority:
 *                     tickets:
 *                       urgent: 10
 *                       high: 30
 *                       medium: 50
 *                       low: 30
 *                     serviceOrders:
 *                       urgent: 8
 *                       high: 22
 *                       medium: 32
 *                       low: 18
 *                   kpis:
 *                     - { label: 'Tickets', value: 120 }
 *                     - { label: 'Tickets em aberto', value: 35 }
 *                     - { label: 'Ordens de Serviço', value: 80 }
 *                     - { label: 'OS pendentes', value: 22 }
*/
router.get('/summary', authMiddleware, statsCacheMiddleware(), validateQuery(reportFilterSchema), (req, res) => reportController.getSummary(req as any, res));

/**
 * @swagger
 * /api/reports/tickets:
 *   get:
 *     summary: Relatório de tickets com filtros e paginação
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: integer
 *         description: Opcional; usa token por padrão
 *     responses:
 *       200:
 *         description: Lista de tickets do relatório
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *             examples:
 *               default:
 *                 value:
 *                   items:
 *                     - { id: 1, status: 'open', priority: 'high', createdAt: '2025-01-10T12:00:00.000Z' }
 *                     - { id: 2, status: 'in_progress', priority: 'medium', createdAt: '2025-01-09T10:30:00.000Z' }
 *                   total: 2
 *                   page: 1
 *                   limit: 20
 */
router.get('/tickets', authMiddleware, validateQuery(reportFilterSchema), (req, res) => reportController.getTickets(req as any, res));

/**
 * @swagger
 * /api/reports/service-orders:
 *   get:
 *     summary: Relatório de ordens de serviço com filtros e paginação
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: integer
 *         description: Opcional; usa token por padrão
 *     responses:
 *       200:
 *         description: Lista de ordens de serviço do relatório
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       scheduledDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       ticketId:
 *                         type: integer
 *                       customer:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *             examples:
 *               default:
 *                 value:
 *                   items:
 *                     - { id: 10, status: 'pending', priority: 'urgent', scheduledDate: '2025-01-12T08:00:00.000Z', createdAt: '2025-01-10T12:00:00.000Z', ticketId: 2, customer: { id: 5, name: 'Cliente ACME' } }
 *                     - { id: 11, status: 'completed', priority: 'medium', scheduledDate: null, createdAt: '2025-01-09T10:30:00.000Z', ticketId: null, customer: null }
 *                   total: 2
 *                   page: 1
 *                   limit: 20
 */
router.get('/service-orders', authMiddleware, validateQuery(reportFilterSchema), (req, res) => reportController.getServiceOrders(req as any, res));

/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Exportação de relatório
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [tickets, service_orders]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx, pdf]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: integer
 *         description: Opcional; usa token por padrão
 *     responses:
 *       200:
 *         description: Arquivo exportado
 */
router.get('/export', authMiddleware, validateQuery(exportReportSchema), (req, res) => reportController.exportReport(req as any, res));

export default router;