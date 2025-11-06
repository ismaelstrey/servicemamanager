import { Response } from 'express';
import type { Ticket } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ClientAuthenticatedRequest } from '../types/customer.types';
import { TicketRepository } from '../repositories/ticketRepository';
import { CommentRepository } from '../repositories/commentRepository';
import { clientCreateTicketSchema, clientListTicketsSchema, clientCommentSchema } from '../validators/clientValidator';
import { ChangeHistoryService } from '../services/changeHistoryService';
import { calculatePagination } from '../utils/paginationHelper';
import { UnifiedTimelineService } from '../services/unifiedTimelineService';
import { SlaService } from '../services/slaService';

// use shared prisma instance

export class ClientTicketController {
  private ticketRepo: TicketRepository;
  private commentRepo: CommentRepository;
  private historyService: ChangeHistoryService;
  private timelineService: UnifiedTimelineService;
  private slaService: SlaService;

  constructor() {
    this.ticketRepo = new TicketRepository();
    this.commentRepo = new CommentRepository();
    this.historyService = new ChangeHistoryService();
    this.timelineService = new UnifiedTimelineService();
    this.slaService = new SlaService();
  }

  async list(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.customer) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const parsed = clientListTicketsSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }

      const { page, limit, status, search, priority } = parsed.data as any;

      const where: any = {
        providerId: req.customer.providerId,
        comments: { some: { customerId: req.customer.id } }
      };

      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const skip = (page - 1) * limit;
      const [ticketsRaw, total]: [Ticket[], number] = await Promise.all([
        prisma.ticket.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.ticket.count({ where })
      ]);

      // Calcular SLA por item
      const tickets = await Promise.all(
        ticketsRaw.map(async (t: Ticket) => ({
          ...t,
          sla: await this.slaService.computeForTicket(req.customer!, req.customer!.providerId, {
            createdAt: t.createdAt,
            priority: t.priority,
            status: t.status
          })
        }))
      );

      res.json({
        success: true,
        data: tickets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar tickets do cliente';
      res.status(500).json({ success: false, message });
    }
  }

  async create(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.customer) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const parsed = clientCreateTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }

      const { title, description, priority } = parsed.data;

      // Cria o ticket vinculado ao provedor do cliente
      const ticket = await this.ticketRepo.create(req.customer.providerId, {
        title,
        description,
        priority,
        source: 'api'
      });

      // Cria um comentário do cliente para associá-lo ao ticket
      await this.commentRepo.create({
        content: description,
        resourceType: 'ticket',
        resourceId: ticket.id,
        providerId: req.customer.providerId,
        customerId: req.customer.id,
        isInternal: false
      });

      res.status(201).json({ success: true, data: ticket });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar ticket do cliente';
      res.status(500).json({ success: false, message });
    }
  }

  async getById(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.customer) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const id = Number(req.params.id);
      if (!id || id <= 0) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const ticket = await this.ticketRepo.findById(id);
      if (!ticket || ticket.providerId !== req.customer.providerId) {
        res.status(404).json({ success: false, message: 'Ticket não encontrado' });
        return;
      }

      // Verificar associação do cliente ao ticket via comentários
      const association = await this.commentRepo.findMany({
        resourceType: 'ticket',
        resourceId: id,
        providerId: req.customer.providerId,
        customerId: req.customer.id,
        page: 1,
        limit: 1
      } as any);

      if (!association || association.total === 0) {
        res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
        return;
      }

      const comments = await this.commentRepo.findByResource('ticket', id, false);
      const sla = await this.slaService.computeForTicket(req.customer!, req.customer!.providerId, {
        createdAt: ticket.createdAt,
        priority: ticket.priority,
        status: ticket.status
      });

      res.json({ success: true, data: { ticket, comments, sla } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar ticket do cliente';
      res.status(500).json({ success: false, message });
    }
  }

  async comment(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.customer) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const id = Number(req.params.id);
      if (!id || id <= 0) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const ticket = await this.ticketRepo.findById(id);
      if (!ticket || ticket.providerId !== req.customer.providerId) {
        res.status(404).json({ success: false, message: 'Ticket não encontrado' });
        return;
      }

      // Garantir que o cliente esteja associado ao ticket via comentários anteriores
      const association = await this.commentRepo.findMany({
        resourceType: 'ticket',
        resourceId: id,
        providerId: req.customer.providerId,
        customerId: req.customer.id,
        page: 1,
        limit: 1
      } as any);
      if (!association || association.total === 0) {
        res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
        return;
      }

      const parsed = clientCommentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }

      const created = await this.commentRepo.create({
        content: parsed.data.content,
        resourceType: 'ticket',
        resourceId: id,
        isInternal: false,
        userId: undefined,
        customerId: req.customer.id,
        providerId: req.customer.providerId,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao comentar no ticket';
      res.status(500).json({ success: false, message });
    }
  }

  async uploadAttachment(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.customer) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const id = Number(req.params.id);
      if (!id || id <= 0) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const ticket = await this.ticketRepo.findById(id);
      if (!ticket || ticket.providerId !== req.customer.providerId) {
        res.status(404).json({ success: false, message: 'Ticket não encontrado' });
        return;
      }

      // Garantir associação do cliente ao ticket via comentários anteriores
      const association = await this.commentRepo.findMany({
        resourceType: 'ticket',
        resourceId: id,
        providerId: req.customer.providerId,
        customerId: req.customer.id,
        page: 1,
        limit: 1
      } as any);
      if (!association || association.total === 0) {
        res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
        return;
      }

      const file = (req as any).file as any;
      if (!file) {
        res.status(400).json({ success: false, message: 'Arquivo ausente (field: file)' });
        return;
      }

      const allowed = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      if (!allowed.includes(file.mimetype)) {
        res.status(400).json({ success: false, message: 'Tipo de arquivo não suportado' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        res.status(400).json({ success: false, message: 'Arquivo excede 10MB' });
        return;
      }

      const { uploadBuffer } = await import('../services/storageService');
      const safeName = (file.originalname || 'arquivo').replace(/[^a-zA-Z0-9_.-]/g, '_');
      const key = `attachments/tickets/${id}/${Date.now()}_${safeName}`;
      const { url } = await uploadBuffer(key, file.buffer, file.mimetype);

      // Registrar comentário público com link do anexo
      const comment = await this.commentRepo.create({
        content: `Anexo: ${safeName} (${url})`,
        resourceType: 'ticket',
        resourceId: id,
        isInternal: false,
        userId: undefined,
        customerId: req.customer.id,
        providerId: req.customer.providerId
      });

      res.status(201).json({ success: true, data: { url, fileName: safeName, mimeType: file.mimetype, size: file.size, comment } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar anexo';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * Histórico de mudanças do ticket do cliente
   * GET /api/client/tickets/:id/history
   */
  async history(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.customer) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const id = Number(req.params.id);
      if (!id || id <= 0) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const ticket = await this.ticketRepo.findById(id);
      if (!ticket || ticket.providerId !== req.customer.providerId) {
        res.status(404).json({ success: false, message: 'Ticket não encontrado' });
        return;
      }

      // Verificar associação do cliente ao ticket via comentários
      const association = await this.commentRepo.findMany({
        resourceType: 'ticket',
        resourceId: id,
        providerId: req.customer.providerId,
        customerId: req.customer.id,
        page: 1,
        limit: 1
      } as any);
      if (!association || association.total === 0) {
        res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
        return;
      }

      const { page, limit } = calculatePagination({
        page: req.query.page ? parseInt(String(req.query.page)) : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
        maxLimit: 100,
        defaultLimit: 20
      });

      const result = await this.historyService.listByEntity(req.customer.providerId, 'ticket', id, page, limit);
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
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * Timeline unificada (histórico + comentários públicos) do ticket do cliente
   * GET /api/client/tickets/:id/timeline
   */
  async timeline(req: ClientAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.customer) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const id = Number(req.params.id);
      if (!id || id <= 0) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const ticket = await this.ticketRepo.findById(id);
      if (!ticket || ticket.providerId !== req.customer.providerId) {
        res.status(404).json({ success: false, message: 'Ticket não encontrado' });
        return;
      }

      // Verificar associação do cliente ao ticket via comentários (acesso ao recurso)
      const association = await this.commentRepo.findMany({
        resourceType: 'ticket',
        resourceId: id,
        providerId: req.customer.providerId,
        customerId: req.customer.id,
        page: 1,
        limit: 1
      } as any);
      if (!association || association.total === 0) {
        res.status(403).json({ success: false, message: 'Você não possui acesso a este ticket' });
        return;
      }

      const { page, limit } = calculatePagination({
        page: req.query.page ? parseInt(String(req.query.page)) : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
        maxLimit: 100,
        defaultLimit: 20
      });

      const result = await this.timelineService.listForClient(req.customer.providerId, 'ticket', id, page, limit);
      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        message: 'Timeline obtida com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter timeline do ticket';
      res.status(500).json({ success: false, message });
    }
  }
}