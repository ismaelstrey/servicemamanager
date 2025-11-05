import { prisma } from '../lib/prisma';
import { normalizeEvolution, normalizeWatiicket, NormalizedWhatsAppMessage } from '../integrations/whatsapp/normalizers';
import { normalizeTelegram } from '../integrations/telegram/normalizers';
import { emitMessageNew } from '../events/socketPublisher';

export class IntegrationProcessingService {
  private prisma = prisma;

  async processPending(limit: number = 20): Promise<{ processed: number; failed: number }> {
    const events = await this.prisma.webhookEvent.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        integration: { include: { channel: true } }
      }
    });

    let processed = 0;
    let failed = 0;

    for (const evt of events) {
      try {
        const provider = (evt.integration?.metadata as any)?.provider || evt.integration?.channel?.type;
        const normalized = await this.normalizeEvent(provider as string, evt.payload);
        await this.persistNormalizedMessage(provider as string, evt.integrationAccountId, evt.integration?.channel?.id!, normalized);
        await this.prisma.webhookEvent.update({
          where: { id: evt.id },
          data: { processed: true, processedAt: new Date(), errorMessage: null }
        });
        processed++;
      } catch (err: any) {
        await this.prisma.webhookEvent.update({
          where: { id: evt.id },
          data: { processed: false, errorMessage: err?.message || String(err) }
        });
        failed++;
      }
    }

    return { processed, failed };
  }

  private async normalizeEvent(provider: string, payload: any): Promise<NormalizedWhatsAppMessage> {
    const key = String(provider || '').toLowerCase();
    if (key.includes('evolution')) {
      return normalizeEvolution(payload);
    } else if (key.includes('watiicket') || key.includes('waticket')) {
      return normalizeWatiicket(payload);
    } else if (key.includes('telegram')) {
      return await normalizeTelegram(payload);
    }
    // Fallback para Evolution
    return normalizeEvolution(payload);
  }

  private async persistNormalizedMessage(provider: string, integrationAccountId: number, channelId: number, msg: NormalizedWhatsAppMessage): Promise<void> {
    // Localiza ou cria a conversa
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        externalId: msg.externalConversationId ?? undefined,
        integrationAccountId
      }
    });

    const conv = conversation ?? await this.prisma.conversation.create({
      data: {
        channelId,
        integrationAccountId,
        externalId: msg.externalConversationId ?? undefined,
        status: 'active'
      }
    });

    // Participante (cliente)
    let participant = await this.prisma.participant.findFirst({
      where: {
        conversationId: conv.id,
        role: 'customer',
        externalId: msg.externalSenderId ?? undefined
      }
    });
    if (!participant) {
      participant = await this.prisma.participant.create({
        data: {
          conversationId: conv.id,
          role: 'customer',
          displayName: msg.externalSenderId ?? undefined,
          externalId: msg.externalSenderId ?? undefined
        }
      });
    }

    // Mensagem
    const message = await this.prisma.message.create({
      data: {
        conversationId: conv.id,
        participantId: participant.id,
        direction: msg.direction === 'inbound' ? 'inbound' : 'outbound',
        content: msg.content || '',
        mediaUrl: msg.mediaUrl ?? undefined,
        mimeType: msg.mimeType ?? undefined,
        status: 'sent',
        createdAt: msg.createdAt
      }
    });

    // Download e armazenamento de mídia em MinIO, criação de Attachment
    const enableMedia = (process.env.MEDIA_DOWNLOAD_ENABLED || 'true').toLowerCase() === 'true';
    if (enableMedia && msg.mediaUrl) {
      try {
        const url = msg.mediaUrl;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Falha ao baixar mídia: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mime = msg.mimeType || res.headers.get('content-type') || 'application/octet-stream';
        const ext = (mime.includes('image/') && mime.split('/')[1]) || (mime.includes('application/') && 'bin') || 'bin';
        const providerKey = String(provider || '').toLowerCase().includes('telegram') ? 'telegram' : 'whatsapp';
        const key = `${providerKey}/${conv.id}/${message.id}-${Date.now()}.${ext}`;
        const { uploadBuffer } = await import('./storageService');
        const stored = await uploadBuffer(key, buffer, mime);
        await this.prisma.attachment.create({ data: { messageId: message.id, url: stored.url, mimeType: mime, size: buffer.length } });
      } catch (err) {
        console.warn('[Media] Falha ao processar mídia inbound', err);
      }
    }

    // Emitir evento via WebSocket para atualizar ChatPage em tempo real
    emitMessageNew(conv.id, message);
  }
}