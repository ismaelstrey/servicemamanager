import { Router } from 'express';
import { ClientTicketController } from '../controllers/clientTicketController';
import { clientAuthMiddleware } from '../middlewares/clientAuthMiddleware';
import { validateQuery, validateParams, validateSchema } from '../validators/providerValidator';
import { clientCreateTicketSchema, clientListTicketsSchema, clientCommentSchema } from '../validators/clientValidator';
import { ticketIdParamSchema } from '../validators/ticketValidator';

const router = Router();
const controller = new ClientTicketController();

// Listar tickets do cliente
router.get('/', clientAuthMiddleware, validateQuery(clientListTicketsSchema), (req, res) => controller.list(req as any, res));

// Criar ticket
router.post('/', clientAuthMiddleware, validateSchema(clientCreateTicketSchema), (req, res) => controller.create(req as any, res));

// Obter detalhes do ticket por ID
router.get('/:id', clientAuthMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.getById(req as any, res));

// Adicionar comentário do cliente ao ticket
router.post('/:id/comments', clientAuthMiddleware, validateParams(ticketIdParamSchema), validateSchema(clientCommentSchema), (req, res) => controller.comment(req as any, res));

export default router;