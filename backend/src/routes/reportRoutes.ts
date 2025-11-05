import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { verifyToken } from '../middlewares/authMiddleware';
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
 *     responses:
 *       200:
 *         description: Sumário retornado com sucesso
 */
router.get('/summary', verifyToken, statsCacheMiddleware(), validateQuery(reportFilterSchema.partial()), (req, res) => reportController.getSummary(req as any, res));

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
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de tickets do relatório
 */
router.get('/tickets', verifyToken, validateQuery(reportFilterSchema), (req, res) => reportController.getTickets(req as any, res));

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
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ordens de serviço do relatório
 */
router.get('/service-orders', verifyToken, validateQuery(reportFilterSchema), (req, res) => reportController.getServiceOrders(req as any, res));

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
 *     responses:
 *       200:
 *         description: Arquivo exportado
 */
router.get('/export', verifyToken, validateQuery(exportReportSchema), (req, res) => reportController.exportReport(req as any, res));

export default router;