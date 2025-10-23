import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createTicketSchema,
  listTicketsSchema,
  providerIdParamSchema,
  updateTicketSchema,
  ticketIdParamSchema,
  updateTicketStatusSchema,
  validateSchema,
  validateParams,
  validateQuery
} from '../validators/ticketValidator';
import { listCacheMiddleware, ticketCacheMiddleware, statsCacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const controller = new TicketController();

// Protegidas: exigem autenticação com cache para consultas
router.get('/:providerId/tickets', authMiddleware, validateParams(providerIdParamSchema), validateQuery(listTicketsSchema), listCacheMiddleware(), (req, res) => controller.list(req as any, res));
router.post('/:providerId/tickets', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createTicketSchema), (req, res) => controller.create(req as any, res));
router.get('/:providerId/tickets/stats', authMiddleware, validateParams(providerIdParamSchema), statsCacheMiddleware(), (req, res) => controller.getStats(req as any, res));

// CRUD por ID de ticket com cache para consultas
router.get('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), ticketCacheMiddleware(), (req, res) => controller.getById(req as any, res));
router.put('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), validateSchema(updateTicketSchema), (req, res) => controller.update(req as any, res));
router.put('/tickets/:id/status', authMiddleware, validateParams(ticketIdParamSchema), validateSchema(updateTicketStatusSchema), (req, res) => controller.updateStatus(req as any, res));
router.delete('/tickets/:id', authMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.delete(req as any, res));

export default router;