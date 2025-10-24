import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { NotificationService } from '../services/notificationService';
import { ProviderService } from '../services/providerService';
import { calculatePagination } from '../utils/paginationHelper';

export class NotificationController {
  private notificationService: NotificationService;
  private providerService: ProviderService;

  constructor() {
    this.notificationService = new NotificationService();
    this.providerService = new ProviderService();
  }

  /**
   * Listar notificações por provedor
   * GET /api/providers/:providerId/notifications
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      // Verificar acesso ao provider
      await this.providerService.findById(providerId, req.user!);

      const { page, limit } = calculatePagination({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        maxLimit: 100,
        defaultLimit: 10
      });

      const unreadParam = (req.query.unread as string | undefined);
      const unread = typeof unreadParam === 'string' ? unreadParam.toLowerCase() === 'true' ? true : unreadParam.toLowerCase() === 'false' ? false : undefined : undefined;

      const result = await this.notificationService.listByProvider(providerId, { page, limit, unread });
      res.json({
        success: true,
        data: result.notifications,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        },
        message: 'Notificações listadas com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar notificações';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Marcar notificação como lida
   * POST /api/providers/notifications/:id/read
   */
  async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const ok = await this.notificationService.markRead(id);
      if (!ok) {
        res.status(404).json({ success: false, message: 'Notificação não encontrada' });
        return;
      }
      res.json({ success: true, message: 'Notificação marcada como lida' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao marcar notificação como lida';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Marcar todas notificações de um provider como lidas
   * POST /api/providers/:providerId/notifications/mark-all-read
   */
  async markAllRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      // Verificar acesso ao provider
      await this.providerService.findById(providerId, req.user!);

      const count = await this.notificationService.markAllReadByProvider(providerId);
      res.json({ success: true, data: { updated: count }, message: 'Notificações marcadas como lidas' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao marcar todas como lidas';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }
}