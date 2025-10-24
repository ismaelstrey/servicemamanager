import { Router } from 'express';
import { ClientProfileController } from '../controllers/clientProfileController';
import { clientAuthMiddleware } from '../middlewares/clientAuthMiddleware';
import { validateSchema } from '../validators/providerValidator';
import { clientUpdateProfileSchema } from '../validators/clientValidator';

const router = Router();
const controller = new ClientProfileController();

router.put('/', clientAuthMiddleware, validateSchema(clientUpdateProfileSchema), (req, res) => controller.update(req as any, res));

export default router;