import { Response } from 'express';
import { TicketService } from '../services/ticketService';
import { AuthenticatedRequest } from '../types/api.types';
import { CreateTicketData, ListTicketsQuery, UpdateTicketData, TicketStatus } from '../repositories/ticketRepository';

export class TicketController {
  private ticketService: TicketService;

  constructor() {
    this.ticketService = new TicketService();
  }

  /**
   * Listar tickets de um provedor
   * GET /api/providers/:providerId/tickets
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      const query: ListTicketsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || undefined,
        status: (req.query.status as TicketStatus) || undefined,
        priority: (req.query.priority as any) || undefined
      };

      const result = await this.ticketService.list(providerId, query, req.user!);

      res.json({
        success: true,
        data: result.tickets,
        pagination: result.pagination,
        message: 'Tickets listados com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar tickets';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Criar ticket para um provedor
   * POST /api/providers/:providerId/tickets
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      const data: CreateTicketData = req.body;
      const ticket = await this.ticketService.create(providerId, data, req.user!);

      res.status(201).json({
        success: true,
        data: ticket,
        message: 'Ticket criado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar ticket';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Obter ticket por ID
   * GET /api/tickets/:id
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const ticket = await this.ticketService.getById(id, req.user!);
      res.json({ success: true, data: ticket, message: 'Ticket obtido com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter ticket';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Atualizar ticket por ID
   * PUT /api/tickets/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const data: UpdateTicketData = req.body;
      const ticket = await this.ticketService.update(id, data, req.user!);
      res.json({ success: true, data: ticket, message: 'Ticket atualizado com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar ticket';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Alterar status do ticket
   * PUT /api/tickets/:id/status
   */
  async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const { status } = req.body as { status: TicketStatus };
      const ticket = await this.ticketService.updateStatus(id, status, req.user!);
      res.json({ success: true, data: ticket, message: 'Status do ticket atualizado com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status do ticket';
      const statusCode = (error as any)?.status || 500;
      res.status(statusCode).json({ success: false, message });
    }
  }

  /**
   * Remover ticket por ID
   * DELETE /api/tickets/:id
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      await this.ticketService.delete(id, req.user!);
      res.json({ success: true, message: 'Ticket removido com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover ticket';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Estatísticas de tickets por Provider
   * GET /api/providers/:providerId/tickets/stats
   */
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }
      const stats = await this.ticketService.getStats(providerId, req.user!);
      res.json({ success: true, data: stats, message: 'Estatísticas obtidas com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }
}