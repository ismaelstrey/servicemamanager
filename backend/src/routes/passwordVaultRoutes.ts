import { Router } from 'express';
import { PasswordVaultController } from '../controllers/passwordVaultController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createPasswordVaultSchema,
  listPasswordVaultsSchema,
  providerIdParamSchema,
  updatePasswordVaultSchema,
  vaultIdParamSchema,
  validateSchema,
  validateParams,
  validateQuery
} from '../validators/passwordVaultValidator';

const router = Router();
const controller = new PasswordVaultController();

// Protegidas: exigem autenticação
router.get('/:providerId/passwords', authMiddleware, validateParams(providerIdParamSchema), validateQuery(listPasswordVaultsSchema), (req, res) => controller.list(req as any, res));
router.post('/:providerId/passwords', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createPasswordVaultSchema), (req, res) => controller.create(req as any, res));

// CRUD por ID
router.get('/passwords/:id', authMiddleware, validateParams(vaultIdParamSchema), (req, res) => controller.getById(req as any, res));
router.put('/passwords/:id', authMiddleware, validateParams(vaultIdParamSchema), validateSchema(updatePasswordVaultSchema), (req, res) => controller.update(req as any, res));
router.delete('/passwords/:id', authMiddleware, validateParams(vaultIdParamSchema), (req, res) => controller.delete(req as any, res));

export default router;