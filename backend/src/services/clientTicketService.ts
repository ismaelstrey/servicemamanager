import { TicketRepository, CreateTicketData, ListTicketsQuery } from '../repositories/ticketRepository';
import { CommentRepository } from '../repositories/commentRepository';

export class ClientTicketService {
  private ticketRepo: TicketRepository;
  private commentRepo: CommentRepository;

  constructor() {
    this.ticketRepo = new TicketRepository();
    this.commentRepo = new CommentRepository();
  }

  async list(providerId: number, customerId: number, query: ListTicketsQuery) {
    // Lista tickets do provedor onde o cliente possui associação via comentários
    return this.ticketRepo.listByProviderAndCustomer(providerId, customerId, query as any);
  }

  async create(providerId: number, customerId: number, data: CreateTicketData) {
    const ticket = await this.ticketRepo.create(providerId, {
      title: data.title,
      description: data.description,
      priority: data.priority,
      source: data.source || 'api'
    });

    await this.commentRepo.create({
      content: data.description,
      resourceType: 'ticket',
      resourceId: ticket.id,
      providerId,
      customerId,
      isInternal: false
    } as any);

    return ticket;
  }

  async getById(id: number, providerId: number, customerId: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket || ticket.providerId !== providerId) {
      const err: any = new Error('Ticket não encontrado');
      err.status = 404;
      throw err;
    }

    const association = await this.commentRepo.findMany({
      resourceType: 'ticket',
      resourceId: id,
      providerId,
      customerId,
      page: 1,
      limit: 1
    } as any);

    if (!association || association.total === 0) {
      const err: any = new Error('Você não possui acesso a este ticket');
      err.status = 403;
      throw err;
    }

    const comments = await this.commentRepo.findByResource('ticket', id, false);
    return { ticket, comments };
  }

  async comment(ticketId: number, providerId: number, customerId: number, content: string) {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket || ticket.providerId !== providerId) {
      const err: any = new Error('Ticket não encontrado');
      err.status = 404;
      throw err;
    }

    const association = await this.commentRepo.findMany({
      resourceType: 'ticket',
      resourceId: ticketId,
      providerId,
      customerId,
      page: 1,
      limit: 1
    } as any);
    if (!association || association.total === 0) {
      const err: any = new Error('Você não possui acesso a este ticket');
      err.status = 403;
      throw err;
    }

    return this.commentRepo.create({
      content,
      resourceType: 'ticket',
      resourceId: ticketId,
      providerId,
      customerId,
      isInternal: false
    } as any);
  }
}