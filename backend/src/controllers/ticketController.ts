import { Response } from 'express';
import { TicketService } from '../services/ticketService';
import { AuthenticatedRequest } from '../types/api.types';
import { CreateTicketData, ListTicketsQuery, UpdateTicketData, TicketStatus } from '../repositories/ticketRepository';
import { calculatePagination } from '../utils/paginationHelper';
import { AuthUser } from '../types';
import multer from 'multer';
import { AttachmentService } from '../services/attachmentService';
import { CommentService } from '../services/commentService';

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

      // Usar helper de paginação otimizada
      const paginationParams = calculatePagination({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        maxLimit: 100,
        defaultLimit: 10
      });

      const startDateStr = (req.query.startDate as string) || undefined;
      const endDateStr = (req.query.endDate as string) || undefined;

      const query: ListTicketsQuery = {
        page: paginationParams.page,
        limit: paginationParams.limit,
        search: (req.query.search as string) || undefined,
        status: (req.query.status as TicketStatus) || undefined,
        priority: (req.query.priority as any) || undefined,
        startDate: startDateStr ? new Date(startDateStr) : undefined,
        endDate: endDateStr ? new Date(endDateStr) : undefined
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
   * Listar tickets globalmente (sem provider)
   * GET /api/tickets
   */
  async listAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const paginationParams = calculatePagination({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        maxLimit: 100,
        defaultLimit: 10
      });

      const startDateStr = (req.query.startDate as string) || undefined;
      const endDateStr = (req.query.endDate as string) || undefined;

      const query: ListTicketsQuery = {
        page: paginationParams.page,
        limit: paginationParams.limit,
        search: (req.query.search as string) || undefined,
        status: (req.query.status as TicketStatus) || undefined,
        priority: (req.query.priority as any) || undefined,
        startDate: startDateStr ? new Date(startDateStr) : undefined,
        endDate: endDateStr ? new Date(endDateStr) : undefined
      };

      const result = await this.ticketService.listAll(query, req.user!);
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
   * Novo: criar ticket vinculado automaticamente ao provedor do usuário
   * POST /api/tickets
   */
  async createForCurrentProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = (req.user as AuthUser)?.providerId;
      if (!providerId) {
        res.status(400).json({ success: false, message: 'Usuário não vinculado a um provedor' });
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
   * Obter ticket por ID incluindo dados do provedor
   * GET /api/tickets/:id/with-provider
   */
  async getByIdWithProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const result = await this.ticketService.getByIdWithProvider(id, req.user!);
      res.json({ success: true, data: result, message: 'Ticket + provedor obtidos com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter ticket com provedor';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Listar anexos do ticket
   * GET /api/tickets/:id/attachments
   */
  async listAttachments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const ticket = await this.ticketService.getById(id, req.user!);
      const attachments = await (this.ticketService as any).repository.listAttachments(ticket.id);
      res.json({ success: true, data: attachments });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar anexos';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Upload de anexo
   * POST /api/tickets/:id/attachments
   */
  async uploadAttachment(req: AuthenticatedRequest & { file?: Express.Multer.File }, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const ticket = await this.ticketService.getById(id, req.user!);
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, message: 'Arquivo não enviado' });
        return;
      }
      const allowed = new Set([
        'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml',
        'application/pdf', 'text/plain', 'application/zip', 'application/x-zip-compressed',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]);
      if (!allowed.has(file.mimetype)) {
        res.status(400).json({ success: false, message: 'Tipo de arquivo não permitido' });
        return;
      }
      const saver = new AttachmentService();
      const meta = await saver.saveTicketAttachment(ticket.id, { originalname: file.originalname, mimetype: file.mimetype, buffer: file.buffer, size: file.size });
      const created = await (this.ticketService as any).repository.createAttachment(ticket.id, meta);
      res.status(201).json({ success: true, data: created, message: 'Anexo enviado com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar anexo';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Remover anexo
   * DELETE /api/tickets/:id/attachments/:attachmentId
   */
  async deleteAttachment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const attachmentId = parseInt(req.params.attachmentId);
      if (isNaN(id) || isNaN(attachmentId)) {
        res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
        return;
      }
      const ticket = await this.ticketService.getById(id, req.user!);
      const ok = await (this.ticketService as any).repository.deleteAttachment(ticket.id, attachmentId);
      if (!ok) {
        res.status(404).json({ success: false, message: 'Anexo não encontrado' });
        return;
      }
      res.json({ success: true, message: 'Anexo removido com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover anexo';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Associar tags ao ticket
   * POST /api/tickets/:id/tags
   */
  async addTags(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'id inválido' }); return; }
      await this.ticketService.getById(id, req.user!);
      const tags = Array.isArray((req.body as any)?.tags) ? (req.body as any).tags : []
      const added = await (this.ticketService as any).repository.addTags(id, tags)
      res.status(201).json({ success: true, data: added, message: 'Tags associadas' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao associar tags';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Listar tags do ticket
   * GET /api/tickets/:id/tags
   */
  async listTags(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'id inválido' }); return; }
      await this.ticketService.getById(id, req.user!);
      const tags = await (this.ticketService as any).repository.listTags(id)
      res.json({ success: true, data: tags })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar tags';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Remover tag do ticket
   * DELETE /api/tickets/:id/tags/:tagId
   */
  async removeTag(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const tagId = parseInt(req.params.tagId);
      if (isNaN(id) || isNaN(tagId)) { res.status(400).json({ success: false, message: 'Parâmetros inválidos' }); return; }
      await this.ticketService.getById(id, req.user!);
      const ok = await (this.ticketService as any).repository.removeTag(id, tagId)
      if (!ok) { res.status(404).json({ success: false, message: 'Tag não encontrada' }); return; }
      res.json({ success: true, message: 'Tag removida' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover tag';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Criar anotação no ticket
   * POST /api/tickets/:id/annotations
   */
  async addAnnotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'id inválido' }); return; }
      const ticket = await this.ticketService.getById(id, req.user!);
      const { content, isInternal } = req.body as { content: string; isInternal?: boolean }
      if (!content || !content.trim()) { res.status(400).json({ success: false, message: 'Conteúdo obrigatório' }); return; }
      const commentService = new CommentService()
      const created = await commentService.createComment({ content, resourceType: 'ticket', resourceId: ticket.id, isInternal: Boolean(isInternal), providerId: ticket.providerId, userId: (req.user as any)?.id }, { id: (req.user as any)?.id, name: '' })
      res.status(201).json({ success: true, data: created, message: 'Anotação criada' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar anotação';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Listar anotações do ticket
   * GET /api/tickets/:id/annotations
   */
  async listAnnotations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'id inválido' }); return; }
      const ticket = await this.ticketService.getById(id, req.user!);
      const includeInternal = String(req.query.includeInternal ?? 'true').toLowerCase() !== 'false'
      const commentService = new CommentService()
      const comments = await commentService.getCommentsByResource('ticket', ticket.id, ticket.providerId, includeInternal)
      res.json({ success: true, data: comments })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar anotações';
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

  /**
   * Kanban por Provider
   * GET /api/providers/:providerId/tickets/kanban
   */
  async kanban(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : undefined;
      const board = await this.ticketService.getKanban(providerId, req.user!, limit);
      res.json({ success: true, data: board, message: 'Kanban obtido com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter Kanban';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Kanban global (todos os tickets acessíveis ao usuário)
   * GET /api/tickets/kanban
   */
  async kanbanAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { providerId } = req.query as { providerId?: string };
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : undefined;
      if (providerId) {
        const id = parseInt(providerId);
        if (isNaN(id)) {
          res.status(400).json({ success: false, message: 'providerId inválido' });
          return;
        }
        const board = await this.ticketService.getKanban(id, req.user!, limit);
        res.json({ success: true, data: board, message: 'Kanban obtido com sucesso' });
        return;
      }
      const board = await this.ticketService.getKanbanAll(req.user!, limit);
      res.json({ success: true, data: board, message: 'Kanban obtido com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter Kanban';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Histórico de mudanças do ticket
   * GET /api/tickets/:id/history
   */
  async history(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const { page, limit } = calculatePagination({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        maxLimit: 100,
        defaultLimit: 20
      });
      const result = await this.ticketService.getHistory(id, req.user!, page, limit);
      res.json({
        success: true,
        data: result.history,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        },
        message: 'Histórico obtido com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter histórico do ticket';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }
}
