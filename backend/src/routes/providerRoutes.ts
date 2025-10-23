import { Router } from 'express';
import { ProviderController } from '../controllers/providerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createProviderSchema,
  updateProviderSchema,
  listProvidersSchema,
  providerIdSchema,
  workspaceParamSchema,
  updateStatusSchema,
  inviteUserSchema,
  providerSettingsSchema,
  validateSchema,
  validateParams,
  validateQuery
} from '../validators/providerValidator';

// Rotas de provedores
const router = Router();
const controller = new ProviderController();

// Public: verificar disponibilidade de workspace
router.get('/check-workspace/:workspace', validateParams(workspaceParamSchema), (req, res) => controller.checkWorkspace(req, res));

// Protegidas: todas abaixo exigem autenticação
router.post('/', authMiddleware, validateSchema(createProviderSchema), (req, res) => controller.create(req as any, res));
router.get('/', authMiddleware, validateQuery(listProvidersSchema), (req, res) => controller.list(req as any, res));
router.get('/:id', authMiddleware, validateParams(providerIdSchema), (req, res) => controller.getById(req as any, res));
router.get('/workspace/:workspace', authMiddleware, validateParams(workspaceParamSchema), (req, res) => controller.getByWorkspace(req as any, res));
router.put('/:id', authMiddleware, validateParams(providerIdSchema), validateSchema(updateProviderSchema), (req, res) => controller.update(req as any, res));
router.delete('/:id', authMiddleware, validateParams(providerIdSchema), (req, res) => controller.delete(req as any, res));
router.patch('/:id/status', authMiddleware, validateParams(providerIdSchema), validateSchema(updateStatusSchema), (req, res) => controller.toggleStatus(req as any, res));
router.get('/:id/stats', authMiddleware, validateParams(providerIdSchema), (req, res) => controller.getStats(req as any, res));
router.post('/:id/invite', authMiddleware, validateParams(providerIdSchema), validateSchema(inviteUserSchema), (req, res) => controller.inviteUser(req as any, res));
router.get('/:id/users', authMiddleware, validateParams(providerIdSchema), (req, res) => controller.getUsers(req as any, res));
router.put('/:id/settings', authMiddleware, validateParams(providerIdSchema), validateSchema(providerSettingsSchema), (req, res) => controller.updateSettings(req as any, res));

export default router;