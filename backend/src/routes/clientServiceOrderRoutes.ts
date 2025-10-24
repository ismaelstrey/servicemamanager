import { Router } from 'express';
import { ClientServiceOrderController } from '../controllers/clientServiceOrderController';
import { clientAuthMiddleware } from '../middlewares/clientAuthMiddleware';
import { validateQuery, validateParams, validateSchema } from '../validators/providerValidator';
import { clientCreateServiceOrderSchema, clientListServiceOrdersSchema, clientCommentSchema, clientQualificationSchema, clientUpdateServiceOrderSchema } from '../validators/clientValidator';

const router = Router();
const controller = new ClientServiceOrderController();

// Listar OS do cliente
router.get('/', clientAuthMiddleware, validateQuery(clientListServiceOrdersSchema), (req, res) => controller.list(req as any, res));

// Detalhar OS do cliente
router.get('/:id', clientAuthMiddleware, validateParams(validateParamsSchema()), (req, res) => controller.getById(req as any, res));

// Criar OS
router.post('/', clientAuthMiddleware, validateSchema(clientCreateServiceOrderSchema), (req, res) => controller.create(req as any, res));

// Comentar em OS
router.post('/:id/comments', clientAuthMiddleware, validateParams(validateParamsSchema()), validateSchema(clientCommentSchema), (req, res) => controller.comment(req as any, res));

// Qualificar OS
router.post('/:id/qualification', clientAuthMiddleware, validateParams(validateParamsSchema()), validateSchema(clientQualificationSchema), (req, res) => controller.qualify(req as any, res));

router.put('/:id', clientAuthMiddleware, validateParams(validateParamsSchema()), validateSchema(clientUpdateServiceOrderSchema), (req, res) => controller.update(req as any, res));

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