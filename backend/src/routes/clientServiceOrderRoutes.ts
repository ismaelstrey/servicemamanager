import { Router } from 'express';
import multer from 'multer';
import { ClientServiceOrderController } from '../controllers/clientServiceOrderController';
import { clientAuthMiddleware } from '../middlewares/clientAuthMiddleware';
import { validateQuery, validateParams, validateSchema } from '../validators/providerValidator';
import { requireClientRole } from '../middlewares/clientRbacMiddleware';
import { clientServiceOrderAuditMiddleware, clientCommentsAuditMiddleware, clientQualificationAuditMiddleware, clientAttachmentAuditMiddleware } from '../middleware/clientAuditMiddleware';
import { clientCreateServiceOrderSchema, clientListServiceOrdersSchema, clientCommentSchema, clientQualificationSchema, clientUpdateServiceOrderSchema } from '../validators/clientValidator';
import { historyQuerySchema } from '../validators/serviceOrderValidator';

const router = Router();
const controller = new ClientServiceOrderController();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Listar OS do cliente
router.get('/', clientAuthMiddleware, validateQuery(clientListServiceOrdersSchema), (req, res) => controller.list(req as any, res));

// Detalhar OS do cliente
router.get('/:id', clientAuthMiddleware, validateParams(validateParamsSchema()), (req, res) => controller.getById(req as any, res));
// Timeline unificada da OS do cliente
router.get('/:id/timeline', clientAuthMiddleware, validateParams(validateParamsSchema()), validateQuery(historyQuerySchema), (req, res) => controller.timeline(req as any, res));
// Histórico da OS do cliente
router.get('/:id/history', clientAuthMiddleware, validateParams(validateParamsSchema()), validateQuery(historyQuerySchema), (req, res) => controller.history(req as any, res));

// Criar OS
router.post('/', clientAuthMiddleware, validateSchema(clientCreateServiceOrderSchema), clientServiceOrderAuditMiddleware, (req, res) => controller.create(req as any, res));

// Comentar em OS
router.post('/:id/comments', clientAuthMiddleware, validateParams(validateParamsSchema()), validateSchema(clientCommentSchema), clientCommentsAuditMiddleware, (req, res) => controller.comment(req as any, res));

// Qualificar OS
router.post('/:id/qualification', clientAuthMiddleware, validateParams(validateParamsSchema()), validateSchema(clientQualificationSchema), clientQualificationAuditMiddleware, (req, res) => controller.qualify(req as any, res));

// Atualização de OS: restrita a customer_admin
router.put('/:id', clientAuthMiddleware, requireClientRole(['customer_admin']), validateParams(validateParamsSchema()), validateSchema(clientUpdateServiceOrderSchema), clientServiceOrderAuditMiddleware, (req, res) => controller.update(req as any, res));

// Upload de anexos para OS do cliente (multipart/form-data com field "file")
router.post('/:id/attachments', clientAuthMiddleware, validateParams(validateParamsSchema()), upload.single('file'), clientAttachmentAuditMiddleware, (req, res) => controller.uploadAttachment(req as any, res));

function validateParamsSchema() {
  // Reutiliza padrão de ID numérico positivo
  return {
    safeParse: (params: any) => {
      const id = Number(params.id);
      if (!params.id || isNaN(id) || id <= 0) {
        return { success: false, error: { errors: [{ path: ['id'], message: 'ID deve ser um número inteiro positivo' }] } } as any;
      }
      return { success: true, data: { id } } as any;
    }
  } as any;
}

export default router;