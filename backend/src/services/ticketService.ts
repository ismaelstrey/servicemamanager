import { AuthUser } from '../types/auth.types';
import { PaginationMeta } from '../types/common.types';
import { ProviderService } from './providerService';
import { TicketRepository, CreateTicketData, ListTicketsQuery, TicketRecord, TicketStats, UpdateTicketData, TicketStatus } from '../repositories/ticketRepository';

export class TicketService {
  private repository: TicketRepository;
  private providerService: ProviderService;

  constructor() {
    this.repository = new TicketRepository();
    this.providerService = new ProviderService();
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
}