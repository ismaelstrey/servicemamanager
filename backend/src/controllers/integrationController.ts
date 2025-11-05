import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

export class IntegrationController {
  private prisma = prisma;

  private async findAccountIdByChannel(type: 'whatsapp' | 'telegram' | 'site'): Promise<number | null> {
    const acc = await this.prisma.integrationAccount.findFirst({
      where: { isActive: true, channel: { type } },
      select: { id: true }
    });
    return acc?.id ?? null;
  }

  private async findAccountIdByProvider(provider: 'evolution' | 'watiicket' | 'telegram'): Promise<number | null> {
    try {
      const acc = await this.prisma.integrationAccount.findFirst({
        where: {
          isActive: true,
          channel: { type: provider === 'telegram' ? 'telegram' : 'whatsapp' },
          metadata: {
            path: ['provider'],
            equals: provider
          } as any
        },
        select: { id: true }
      });
      return acc?.id ?? null;
    } catch (_err) {
      // Fallback silencioso
      return null;
    }
  }

  async receiveEvolutionWebhook(req: Request, res: Response) {
    const event = req.body;
    console.info('[Integration] Evolution webhook received', {
      headers: req.headers,
      eventType: event?.type || event?.event || 'unknown',
    });
    try {
      const integrationAccountId = await this.findAccountIdByProvider('evolution')
        || await this.findAccountIdByChannel('whatsapp');
      if (integrationAccountId) {
        const externalEventId = event?.messageId || event?.id || event?.eventId || randomUUID();
        await this.prisma.webhookEvent.create({
          data: {
            integrationAccountId,
            externalEventId,
            payload: event,
            processed: false
          }
        });
      } else {
        console.warn('[Integration] Evolution webhook: nenhuma IntegrationAccount ativa para WhatsApp encontrada');
      }
      return res.status(202).json({ status: 'accepted' });
    } catch (err) {
      console.error('[Integration] Evolution webhook persist failed', err);
      return res.status(500).json({ error: 'Falha ao persistir webhook' });
    }
  }

  async receiveWatiicketWebhook(req: Request, res: Response) {
    const event = req.body;
    console.info('[Integration] WaTicket webhook received', {
      headers: req.headers,
      eventType: event?.type || event?.event || 'unknown',
    });
    try {
      const integrationAccountId = await this.findAccountIdByProvider('watiicket')
        || await this.findAccountIdByChannel('whatsapp');
      if (integrationAccountId) {
        const externalEventId = event?.messageId || event?.id || event?.eventId || randomUUID();
        await this.prisma.webhookEvent.create({
          data: {
            integrationAccountId,
            externalEventId,
            payload: event,
            processed: false
          }
        });
      } else {
        console.warn('[Integration] WaTicket webhook: nenhuma IntegrationAccount ativa para WhatsApp encontrada');
      }
      return res.status(202).json({ status: 'accepted' });
    } catch (err) {
      console.error('[Integration] WaTicket webhook persist failed', err);
      return res.status(500).json({ error: 'Falha ao persistir webhook' });
    }
  }

  async receiveTelegramWebhook(req: Request, res: Response) {
    const update = req.body;
    console.info('[Integration] Telegram webhook received', {
      headers: req.headers,
      updateType: update?.message ? 'message' : 'update',
    });
    try {
      const integrationAccountId = await this.findAccountIdByChannel('telegram');
      if (integrationAccountId) {
        const externalEventId = update?.update_id?.toString() || update?.message?.message_id?.toString() || randomUUID();
        await this.prisma.webhookEvent.create({
          data: {
            integrationAccountId,
            externalEventId,
            payload: update,
            processed: false
          }
        });
      } else {
        console.warn('[Integration] Telegram webhook: nenhuma IntegrationAccount ativa para Telegram encontrada');
      }
      return res.status(202).json({ status: 'accepted' });
    } catch (err) {
      console.error('[Integration] Telegram webhook persist failed', err);
      return res.status(500).json({ error: 'Falha ao persistir webhook' });
    }
  }

  async sendWhatsAppMessage(req: Request, res: Response) {
    const { to, message, provider, photoUrl, documentUrl, caption, mimeType } = req.body || {};
    if (!to || (!message && !photoUrl && !documentUrl)) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: to e (message ou photoUrl ou documentUrl)' });
    }
    try {
      // Seleciona IntegrationAccount (por provider específico se informado)
      let integrationAccountId: number | null = null;
      if (provider && typeof provider === 'string') {
        const prov = provider.toLowerCase();
        if (prov === 'evolution' || prov === 'watiicket') {
          integrationAccountId = await this.findAccountIdByProvider(prov as any);
        }
      }
      if (!integrationAccountId) {
        integrationAccountId = await this.findAccountIdByChannel('whatsapp');
      }
      if (!integrationAccountId) {
        return res.status(409).json({ error: 'Nenhuma IntegrationAccount ativa para WhatsApp encontrada' });
      }

      // Obter channelId para criar/associar conversa
      const integration = await this.prisma.integrationAccount.findUnique({
        where: { id: integrationAccountId },
        select: { id: true, channelId: true }
      });
      if (!integration) {
        return res.status(409).json({ error: 'IntegrationAccount inválida' });
      }

      // Localiza conversa pelo externalId (número do cliente)
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          integrationAccountId: integration.id,
          externalId: to
        }
      });
      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            channelId: integration.channelId,
            integrationAccountId: integration.id,
            externalId: to,
            status: 'active'
          }
        });
        // Cria participante cliente
        await this.prisma.participant.create({
          data: {
            conversationId: conversation.id,
            role: 'customer',
            displayName: to,
            externalId: to
          }
        });
      }

      // Enfileira envio na OutboundQueue
      const queue = await this.prisma.outboundQueue.create({
        data: {
          integrationAccountId: integration.id,
          conversationId: conversation.id,
          payload: {
            to,
            message: message ?? null,
            photoUrl: photoUrl ?? null,
            documentUrl: documentUrl ?? null,
            caption: caption ?? null,
            mimeType: mimeType ?? null,
            provider: provider ?? 'whatsapp'
          }
        }
      });

      // Enfileira também no BullMQ quando habilitado
      if ((process.env.OUTBOUND_BULLMQ_ENABLED || 'false').toLowerCase() === 'true') {
        try {
          const { enqueueOutbound } = await import('../queues/outboundQueue');
          await enqueueOutbound(queue.id);
          console.info('[Integration] Outbound enfileirado em BullMQ', { queueId: queue.id, to });
        } catch (err) {
          console.warn('[Integration] Falha ao enfileirar no BullMQ, ficará na fila DB/worker', err);
        }
      } else {
        console.info('[Integration] WhatsApp outbound enfileirado (DB worker)', { queueId: queue.id, to });
      }
      return res.status(202).json({ status: 'queued', to, queueId: queue.id, conversationId: conversation.id });
    } catch (err) {
      console.error('[Integration] Falha ao enfileirar WhatsApp outbound', err);
      return res.status(500).json({ error: 'Falha ao enfileirar mensagem' });
    }
  }

  async sendTelegramMessage(req: Request, res: Response) {
    const { chatId, message, photoUrl, documentUrl, caption, mimeType } = req.body || {};
    if (!chatId || (!message && !photoUrl && !documentUrl)) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: chatId e (message ou photoUrl ou documentUrl)' });
    }
    try {
      const integrationAccountId = await this.findAccountIdByChannel('telegram');
      if (!integrationAccountId) {
        return res.status(409).json({ error: 'Nenhuma IntegrationAccount ativa para Telegram encontrada' });
      }

      const integration = await this.prisma.integrationAccount.findUnique({
        where: { id: integrationAccountId },
        select: { id: true, channelId: true }
      });
      if (!integration) {
        return res.status(409).json({ error: 'IntegrationAccount inválida' });
      }

      // Localiza conversa pelo chatId do Telegram
      let conversation = await this.prisma.conversation.findFirst({
        where: { integrationAccountId: integration.id, externalId: String(chatId) }
      });
      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            channelId: integration.channelId,
            integrationAccountId: integration.id,
            externalId: String(chatId),
            status: 'active'
          }
        });
        await this.prisma.participant.create({
          data: {
            conversationId: conversation.id,
            role: 'customer',
            displayName: String(chatId),
            externalId: String(chatId)
          }
        });
      }

      const queue = await this.prisma.outboundQueue.create({
        data: {
          integrationAccountId: integration.id,
          conversationId: conversation.id,
          payload: {
            chatId: String(chatId),
            message: message ?? null,
            photoUrl: photoUrl ?? null,
            documentUrl: documentUrl ?? null,
            caption: caption ?? null,
            mimeType: mimeType ?? null,
            provider: 'telegram'
          }
        }
      });

      if ((process.env.OUTBOUND_BULLMQ_ENABLED || 'false').toLowerCase() === 'true') {
        try {
          const { enqueueOutbound } = await import('../queues/outboundQueue');
          await enqueueOutbound(queue.id);
          console.info('[Integration] Telegram outbound enfileirado em BullMQ', { queueId: queue.id, chatId });
        } catch (err) {
          console.warn('[Integration] Falha ao enfileirar Telegram no BullMQ, ficará na fila DB/worker', err);
        }
      } else {
        console.info('[Integration] Telegram outbound enfileirado (DB worker)', { queueId: queue.id, chatId });
      }

      return res.status(202).json({ status: 'queued', chatId, queueId: queue.id, conversationId: conversation.id });
    } catch (err) {
      console.error('[Integration] Falha ao enfileirar Telegram outbound', err);
      return res.status(500).json({ error: 'Falha ao enfileirar mensagem' });
    }
  }

  async listWebhookEvents(req: Request, res: Response) {
    try {
      const channel = (req.query.channel as string | undefined)?.toLowerCase();
      const rawLimit = (req.query.limit as string | undefined) ?? '50';
      const limitParsed = parseInt(rawLimit, 10);
      const limit = Number.isFinite(limitParsed) ? Math.min(Math.max(limitParsed, 1), 200) : 50;

      const allowed: Array<'whatsapp' | 'telegram' | 'site'> = ['whatsapp', 'telegram', 'site'];
      let where: any = {};
      if (channel) {
        if (!allowed.includes(channel as any)) {
          return res.status(400).json({ error: 'Canal inválido. Use whatsapp, telegram ou site' });
        }
        // Filtra por relação (to-one) usando is/isNot e relação encadeada
        where = { integration: { is: { channel: { is: { type: channel } } } } };
      }

      const events = await this.prisma.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          integration: {
            select: {
              id: true,
              channel: { select: { id: true, type: true, name: true } }
            }
          }
        }
      });

      const data = events.map((e: any) => ({
        id: e.id,
        externalEventId: e.externalEventId,
        createdAt: e.createdAt,
        processed: e.processed,
        processedAt: e.processedAt ?? null,
        errorMessage: e.errorMessage ?? null,
        integrationAccountId: e.integrationAccountId,
        channel: e.integration?.channel?.type ?? null,
        channelName: e.integration?.channel?.name ?? null,
        payload: e.payload
      }));

      return res.json({ count: data.length, events: data });
    } catch (err) {
      console.error('[Integration] listWebhookEvents failed', err);
      return res.status(500).json({ error: 'Falha ao listar eventos de webhook' });
    }
  }
}