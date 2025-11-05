import { Router, Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { privacyService } from '../services/privacyService';
import { AuthenticatedRequest } from '../types/api.types';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Atualizar consentimento do usuário autenticado
router.post('/consent', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });
    const { consent } = req.body as { consent: boolean };
    if (typeof consent !== 'boolean') return res.status(400).json({ success: false, message: 'Campo consent inválido' });
    const result = await privacyService.recordConsent(userId, consent);
    return res.status(200).json({ success: result.success });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao atualizar consentimento' });
  }
});

// Solicitar eliminação de dados (DSR)
router.post('/request-erasure', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });
    const result = await privacyService.requestErasure(userId);
    return res.status(202).json({ success: result.success, message: 'Solicitação registrada' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao registrar solicitação' });
  }
});

export default router;