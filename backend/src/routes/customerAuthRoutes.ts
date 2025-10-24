import { Router } from 'express';
import { CustomerAuthController } from '../controllers/customerAuthController';
import { clientAuthMiddleware } from '../middlewares/clientAuthMiddleware';
import { authRateLimit } from '../middlewares/rateLimitMiddleware';

const router = Router();
const controller = new CustomerAuthController();

// Registro do cliente
router.post('/register', authRateLimit, (req, res) => controller.register(req as any, res));

// Login do cliente
router.post('/login', authRateLimit, (req, res) => controller.login(req as any, res));

// Recuperação de senha
router.post('/forgot-password', authRateLimit, (req, res) => controller.forgotPassword(req as any, res));
router.post('/reset-password', authRateLimit, (req, res) => controller.resetPassword(req as any, res));

// Perfil do cliente autenticado
router.get('/profile', clientAuthMiddleware, (req, res) => controller.profile(req as any, res));

export default router;