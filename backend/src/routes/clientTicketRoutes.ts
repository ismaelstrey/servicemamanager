import { Router } from 'express';
import multer from 'multer';
import { ClientTicketController } from '../controllers/clientTicketController';
import { clientAuthMiddleware } from '../middlewares/clientAuthMiddleware';
import { validateQuery, validateParams, validateSchema } from '../validators/providerValidator';
import { clientCreateTicketSchema, clientListTicketsSchema, clientCommentSchema } from '../validators/clientValidator';
import { ticketIdParamSchema, historyQuerySchema } from '../validators/ticketValidator';

const router = Router();
const controller = new ClientTicketController();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Listar tickets do cliente
router.get('/', clientAuthMiddleware, validateQuery(clientListTicketsSchema), (req, res) => controller.list(req as any, res));

// Criar ticket
router.post('/', clientAuthMiddleware, validateSchema(clientCreateTicketSchema), (req, res) => controller.create(req as any, res));

// Obter detalhes do ticket por ID
router.get('/:id', clientAuthMiddleware, validateParams(ticketIdParamSchema), (req, res) => controller.getById(req as any, res));
// Timeline unificada do ticket do cliente
router.get('/:id/timeline', clientAuthMiddleware, validateParams(ticketIdParamSchema), validateQuery(historyQuerySchema), (req, res) => controller.timeline(req as any, res));
// Histórico do ticket do cliente
router.get('/:id/history', clientAuthMiddleware, validateParams(ticketIdParamSchema), validateQuery(historyQuerySchema), (req, res) => controller.history(req as any, res));

// Adicionar comentário do cliente ao ticket
router.post('/:id/comments', clientAuthMiddleware, validateParams(ticketIdParamSchema), validateSchema(clientCommentSchema), (req, res) => controller.comment(req as any, res));

// Upload de anexos para ticket do cliente (multipart/form-data, field "file")
router.post('/:id/attachments', clientAuthMiddleware, validateParams(ticketIdParamSchema), upload.single('file'), (req, res) => controller.uploadAttachment(req as any, res));

export default router;