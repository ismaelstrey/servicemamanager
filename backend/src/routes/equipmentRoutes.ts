import { Router } from 'express';
import { EquipmentController } from '../controllers/equipmentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { 
  createEquipmentSchema,
  listEquipmentsSchema,
  providerIdParamSchema,
  updateEquipmentSchema,
  equipmentIdParamSchema,
  validateSchema,
  validateParams,
  validateQuery
} from '../validators/equipmentValidator';

const router = Router();
const controller = new EquipmentController();

// Protegidas: exigem autenticação
router.get('/:providerId/equipments', authMiddleware, validateParams(providerIdParamSchema), validateQuery(listEquipmentsSchema), (req, res) => controller.list(req as any, res));
router.post('/:providerId/equipments', authMiddleware, validateParams(providerIdParamSchema), validateSchema(createEquipmentSchema), (req, res) => controller.create(req as any, res));
router.get('/:providerId/equipments/stats', authMiddleware, validateParams(providerIdParamSchema), (req, res) => controller.getStats(req as any, res));

// CRUD por ID de equipamento
router.get('/equipments/:id', authMiddleware, validateParams(equipmentIdParamSchema), (req, res) => controller.getById(req as any, res));
router.put('/equipments/:id', authMiddleware, validateParams(equipmentIdParamSchema), validateSchema(updateEquipmentSchema), (req, res) => controller.update(req as any, res));
router.delete('/equipments/:id', authMiddleware, validateParams(equipmentIdParamSchema), (req, res) => controller.delete(req as any, res));

export default router;