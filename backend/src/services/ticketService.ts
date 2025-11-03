import { AuthUser } from '../types/auth.types';
import { PaginationMeta } from '../types/common.types';
import { ProviderService } from './providerService';
import { TicketRepository, CreateTicketData, ListTicketsQuery, TicketRecord, TicketStats, UpdateTicketData, TicketStatus } from '../repositories/ticketRepository';
import { NotificationService } from './notificationService';
import { ChangeHistoryService } from './changeHistoryService';
import { logTicketAudit } from '../utils/auditLogger';
import { invalidateProviderCache, invalidateResourceCache } from '../middleware/cacheMiddleware';

export class TicketService {
  private repository: TicketRepository;
  private providerService: ProviderService;
  private notificationService: NotificationService;
  private changeHistoryService: ChangeHistoryService;

  constructor() {
    this.repository = new TicketRepository();
    this.providerService = new ProviderService();
    this.notificationService = new NotificationService();
    this.changeHistoryService = new ChangeHistoryService();
  }

  private async assertAccess(user: AuthUser, providerId: number): Promise<void> {
    if (user.role === 'super_admin' || user.role === 'admin') return;
    const allowed = await this.providerService.userHasAccess(user.id, providerId);
    if (!allowed) {
      const err: any = new Error('Acesso negado: usuário não possui acesso a este provedor');
      err.status = 403;
      throw err;
    }
  }

  async list(providerId: number, query: ListTicketsQuery, user: AuthUser): Promise<{ tickets: TicketRecord[]; pagination: PaginationMeta; }> {
    await this.assertAccess(user, providerId);
    return this.repository.listByProvider(providerId, query);
  }

  async listAll(query: ListTicketsQuery, user: AuthUser): Promise<{ tickets: TicketRecord[]; pagination: PaginationMeta; }> {
    // Somente administradores podem listar globalmente sem provider
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      const err: any = new Error('Acesso negado: requer perfil admin/super_admin');
      err.status = 403;
      throw err;
    }
    return this.repository.listAll(query);
  }

  async create(providerId: number, data: CreateTicketData, user: AuthUser): Promise<TicketRecord> {
    await this.assertAccess(user, providerId);
    return this.repository.create(providerId, data);
  }

  async getById(id: number, user: AuthUser): Promise<TicketRecord> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      const err: any = new Error('Ticket não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, ticket.providerId);
    return ticket;
  }

  async update(id: number, data: UpdateTicketData, user: AuthUser): Promise<TicketRecord> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Ticket não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, existing.providerId);
    const updated = await this.repository.update(id, data);
    if (!updated) {
      const err: any = new Error('Falha ao atualizar ticket');
      err.status = 500;
      throw err;
    }

    // Histórico de alterações e notificação se houve mudança de status
    if (typeof data.status !== 'undefined' && data.status !== existing.status) {
      await this.changeHistoryService.recordStatusChange('ticket', {
        entityId: id,
        providerId: existing.providerId,
        changedById: user.id,
        from: existing.status,
        to: data.status,
        metadata: { title: updated.title }
      });
      await this.notificationService.createStatusChangeNotification({
        entityType: 'ticket',
        entityId: id,
        providerId: existing.providerId,
        statusFrom: existing.status,
        statusTo: data.status,
        actorName: user.name,
        title: `Ticket #${id} atualizado`
      });
      logTicketAudit(
        'status_change',
        String(user.id),
        user.email,
        String(id),
        String(existing.providerId),
        true,
        undefined,
        undefined,
        undefined,
        { from: existing.status, to: data.status }
      );
      await invalidateProviderCache(String(existing.providerId));
      await invalidateResourceCache('ticket', String(id));
      await invalidateResourceCache('stats');
      // Garantir que boards de Kanban sejam atualizados imediatamente
      await invalidateResourceCache('kanban');
      await invalidateResourceCache('kanban_all');
    }

    return updated;
  }

  async updateStatus(id: number, status: TicketStatus, user: AuthUser): Promise<TicketRecord> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Ticket não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, existing.providerId);
    const updated = await this.repository.updateStatus(id, status);
    if (!updated) {
      const err: any = new Error('Falha ao alterar status do ticket');
      err.status = 500;
      throw err;
    }

    if (existing.status !== status) {
      await this.changeHistoryService.recordStatusChange('ticket', {
        entityId: id,
        providerId: existing.providerId,
        changedById: user.id,
        from: existing.status,
        to: status,
        metadata: { title: updated.title }
      });
      await this.notificationService.createStatusChangeNotification({
        entityType: 'ticket',
        entityId: id,
        providerId: existing.providerId,
        statusFrom: existing.status,
        statusTo: status,
        actorName: user.name,
        title: `Status do Ticket #${id} atualizado`
      });
      logTicketAudit(
        'status_change',
        String(user.id),
        user.email,
        String(id),
        String(existing.providerId),
        true,
        undefined,
        undefined,
        undefined,
        { from: existing.status, to: status }
      );
      await invalidateProviderCache(String(existing.providerId));
      await invalidateResourceCache('ticket', String(id));
      await invalidateResourceCache('stats');
      // Garantir que boards de Kanban sejam atualizados imediatamente
      await invalidateResourceCache('kanban');
      await invalidateResourceCache('kanban_all');
    }

    return updated;
  }

  async delete(id: number, user: AuthUser): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Ticket não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, existing.providerId);
    const ok = await this.repository.delete(id);
    if (!ok) {
      const err: any = new Error('Falha ao remover ticket');
      err.status = 500;
      throw err;
    }
    return true;
  }

  async getStats(providerId: number, user: AuthUser): Promise<TicketStats> {
    await this.assertAccess(user, providerId);
    return this.repository.getStatsByProvider(providerId);
  }
  async getKanban(providerId: number, user: AuthUser, limit?: number) {
    await this.assertAccess(user, providerId);
    return this.repository.getKanbanByProvider(providerId, limit);
  }
  async getKanbanAll(user: AuthUser, limit?: number) {
    // Dependendo da política de acesso, poderia filtrar por providers acessíveis ao usuário.
    // Por ora, retornamos todos os tickets disponíveis.
    return this.repository.getKanbanAll(limit);
  }
  // New: list change history for a ticket
  async getHistory(id: number, user: AuthUser, page?: number, limit?: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Ticket não encontrado');
      err.status = 404;
      throw err;
    }
    await this.assertAccess(user, existing.providerId);
    return await this.changeHistoryService.listByEntity(existing.providerId, 'ticket', id, page, limit);
  }
}