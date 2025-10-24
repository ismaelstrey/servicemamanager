import { Router } from 'express';
import { PasswordVaultController } from '../controllers/passwordVaultController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { sensitiveRateLimit, createResourceRateLimit } from '../middlewares/rateLimitMiddleware';
import {
  createPasswordVaultSchema,
  listPasswordVaultsSchema,
  providerIdParamSchema,
  updatePasswordVaultSchema,
  vaultIdParamSchema,
  rotatePasswordSchema,
  validateSchema,
  validateParams,
  validateQuery
} from '../validators/passwordVaultValidator';

const router = Router();
const controller = new PasswordVaultController();

// Protegidas: exigem autenticação e rate limiting sensível
router.get('/:providerId/passwords', authMiddleware, sensitiveRateLimit, validateParams(providerIdParamSchema), validateQuery(listPasswordVaultsSchema), (req, res) => controller.list(req as any, res));
router.post('/:providerId/passwords', authMiddleware, createResourceRateLimit, validateParams(providerIdParamSchema), validateSchema(createPasswordVaultSchema), (req, res) => controller.create(req as any, res));

// CRUD por ID com rate limiting sensível
router.get('/passwords/:id', authMiddleware, sensitiveRateLimit, validateParams(vaultIdParamSchema), (req, res) => controller.getById(req as any, res));
router.put('/passwords/:id', authMiddleware, sensitiveRateLimit, validateParams(vaultIdParamSchema), validateSchema(updatePasswordVaultSchema), (req, res) => controller.update(req as any, res));
router.post('/passwords/:id/rotate', authMiddleware, sensitiveRateLimit, validateParams(vaultIdParamSchema), validateSchema(rotatePasswordSchema), (req, res) => controller.rotate(req as any, res));
router.delete('/passwords/:id', authMiddleware, sensitiveRateLimit, validateParams(vaultIdParamSchema), (req, res) => controller.delete(req as any, res));

export default router;