import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authRateLimit } from '../middlewares/rateLimitMiddleware';

// Rotas de autenticação agrupadas
const router = Router();
const controller = new AuthController();

router.post('/register', authRateLimit, (req, res) => controller.register(req, res));
router.post('/login', authRateLimit, (req, res) => controller.login(req, res));

export default router;