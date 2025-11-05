import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../types/api.types';

// usar prisma centralizado do lib

export class ChatController {
  async listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const page = req.query.page ? parseInt(String(req.query.page)) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 20;
      const skip = (page - 1) * limit;

      const where = {
        participants: { some: { role: 'agent', externalId: String(userId) } }
      } as const;

      const [items, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.conversation.count({ where })
      ]);

      res.json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar conversas';
      res.status(500).json({ success: false, message });
    }
  }

  async createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const { title, channelId } = (req.body || {}) as { title?: string; channelId?: number };

      let resolvedChannelId: number | undefined = channelId;
      if (!resolvedChannelId) {
        const siteChannel = await prisma.channel.findFirst({
          where: { type: 'site', isActive: true },
          select: { id: true }
        });
        if (!siteChannel) {
          res.status(400).json({ success: false, message: 'Nenhum canal ativo encontrado' });
          return;
        }
        resolvedChannelId = siteChannel.id;
      }

      const conversation = await prisma.conversation.create({
        data: {
          channelId: resolvedChannelId,
          title: title || null,
          participants: {
            create: {
              role: 'agent',
              externalId: String(userId),
              displayName: req.user?.name || null
            }
          }
        }
      });

      res.status(201).json({ success: true, data: conversation });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conversa';
      res.status(500).json({ success: false, message });
    }
  }

  async listMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const conversationId = parseInt(String(req.params.id));
      if (isNaN(conversationId)) {
        res.status(400).json({ success: false, message: 'ID da conversa inválido' });
        return;
      }

      const member = await prisma.participant.findFirst({
        where: { conversationId, role: 'agent', externalId: String(userId) },
        select: { id: true }
      });
      if (!member) {
        res.status(403).json({ success: false, message: 'Acesso negado à conversa' });
        return;
      }

      const page = req.query.page ? parseInt(String(req.query.page)) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 50;
      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit
        }),
        prisma.message.count({ where: { conversationId } })
      ]);

      res.json({
        success: true,
        data: messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar mensagens';
      res.status(500).json({ success: false, message });
    }
  }

  async createMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const { conversationId, content, mimeType } = (req.body || {}) as { conversationId?: number | string; content?: string; mimeType?: string };
      const convId = parseInt(String(conversationId));
      if (!convId || isNaN(convId)) {
        res.status(400).json({ success: false, message: 'conversationId inválido' });
        return;
      }
      if (!content || typeof content !== 'string') {
        res.status(400).json({ success: false, message: 'Conteúdo da mensagem obrigatório' });
        return;
      }

      let participant = await prisma.participant.findFirst({
        where: { conversationId: convId, role: 'agent', externalId: String(userId) }
      });
      if (!participant) {
        participant = await prisma.participant.create({
          data: {
            conversationId: convId,
            role: 'agent',
            externalId: String(userId),
            displayName: req.user?.name || null
          }
        });
      }

      const message = await prisma.message.create({
        data: {
          conversationId: convId,
          participantId: participant.id,
          direction: 'outbound',
          content,
          mimeType: mimeType || null,
          status: 'sent'
        }
      });

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
      res.status(500).json({ success: false, message });
    }
  }

  async uploadAttachment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const { conversationId } = (req.body || {}) as { conversationId?: number | string };
      const convId = parseInt(String(conversationId));
      if (!convId || isNaN(convId)) {
        res.status(400).json({ success: false, message: 'conversationId inválido' });
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
        'application/pdf',
        'text/plain'
      ];
      if (!allowed.includes(file.mimetype)) {
        res.status(400).json({ success: false, message: 'Tipo de arquivo não suportado' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        res.status(400).json({ success: false, message: 'Arquivo excede 10MB' });
        return;
      }

      // Garante participação do agente na conversa
      let participant = await prisma.participant.findFirst({
        where: { conversationId: convId, role: 'agent', externalId: String(userId) }
      });
      if (!participant) {
        participant = await prisma.participant.create({
          data: {
            conversationId: convId,
            role: 'agent',
            externalId: String(userId),
            displayName: req.user?.name || null
          }
        });
      }

      // Upload para S3/MinIO
      const { uploadBuffer } = await import('../services/storageService');
      const safeName = (file.originalname || 'arquivo').replace(/[^a-zA-Z0-9_.-]/g, '_');
      const key = `attachments/${convId}/${Date.now()}_${safeName}`;
      const { url } = await uploadBuffer(key, file.buffer, file.mimetype);

      const message = await prisma.message.create({
        data: {
          conversationId: convId,
          participantId: participant.id,
          direction: 'outbound',
          content: safeName,
          mimeType: file.mimetype,
          status: 'sent',
          attachments: {
            create: {
              url,
              mimeType: file.mimetype,
              size: file.size
            }
          }
        },
        include: { attachments: true }
      });

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar anexo';
      res.status(500).json({ success: false, message });
    }
  }
}

export const chatController = new ChatController();