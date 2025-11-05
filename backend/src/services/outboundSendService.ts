import { prisma } from '../lib/prisma';
import { emitMessageNew } from '../events/socketPublisher';
import { sendMessage as telegramSendMessage, sendPhoto as telegramSendPhoto, sendDocument as telegramSendDocument } from '../integrations/telegram/sender';

export class OutboundSendService {
  private prisma = prisma;

  async processQueueItem(queueId: number) {
    const item = await this.prisma.outboundQueue.findUnique({
      where: { id: queueId },
      include: { integration: { select: { id: true } } }
    });
    if (!item) throw new Error(`OutboundQueue item ${queueId} não encontrado`);

    if (item.status === 'completed') return;
    await this.prisma.outboundQueue.update({ where: { id: item.id }, data: { status: 'processing' } });

    try {
      const payload: any = item.payload || {};
      const content: string = payload?.message || '';

      let agentParticipant = await this.prisma.participant.findFirst({
        where: { conversationId: item.conversationId, role: 'agent' }
      });
      if (!agentParticipant) {
        agentParticipant = await this.prisma.participant.create({
          data: { conversationId: item.conversationId, role: 'agent', displayName: 'Agente' }
        });
      }

      // Envio real por provider
      const provider = String(payload?.provider || '').toLowerCase();
      if (provider === 'telegram') {
        const chatId = String(payload?.chatId || '');
        if (!chatId) throw new Error('chatId obrigatório para envio Telegram');
        const photoUrl: string | undefined = payload?.photoUrl || undefined;
        const documentUrl: string | undefined = payload?.documentUrl || undefined;
        const caption: string | undefined = payload?.caption || undefined;

        if (documentUrl) {
          await telegramSendDocument(chatId, documentUrl, caption ?? content);
        } else if (photoUrl) {
          await telegramSendPhoto(chatId, photoUrl, caption ?? content);
        } else {
          await telegramSendMessage(chatId, content);
        }
      }

      const message = await this.prisma.message.create({
        data: {
          conversationId: item.conversationId,
          participantId: agentParticipant.id,
          direction: 'outbound',
          content,
          mediaUrl: payload?.photoUrl || payload?.documentUrl || undefined,
          mimeType: payload?.mimeType || undefined,
          status: 'sent'
        }
      });

      await this.prisma.outboundQueue.update({ where: { id: item.id }, data: { status: 'completed' } });
      emitMessageNew(item.conversationId, message);
    } catch (err: any) {
      await this.prisma.outboundQueue.update({ where: { id: item.id }, data: { status: 'failed', lastError: err?.message || 'unknown' } });
      throw err;
    }
  }

  async processPending(limit = 20) {
    const items = await this.prisma.outboundQueue.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        integration: { select: { id: true } },
        // conversa já vem via conversationId
      }
    });

    for (const item of items) {
      try {
        await this.prisma.outboundQueue.update({
          where: { id: item.id },
          data: { status: 'processing' }
        });

        const payload: any = item.payload || {};
        const content: string = payload?.message || '';

        // Localiza (ou cria) participante do agente para outbound
        let agentParticipant = await this.prisma.participant.findFirst({
          where: { conversationId: item.conversationId, role: 'agent' }
        });
        if (!agentParticipant) {
          agentParticipant = await this.prisma.participant.create({
            data: { conversationId: item.conversationId, role: 'agent', displayName: 'Agente' }
          });
        }

        // Simula envio ao provedor e persiste mensagem como 'sent'
        const message = await this.prisma.message.create({
          data: {
            conversationId: item.conversationId,
            participantId: agentParticipant.id,
            direction: 'outbound',
            content,
            mediaUrl: (payload?.photoUrl || payload?.documentUrl) ?? undefined,
            mimeType: payload?.mimeType ?? undefined,
            status: 'sent'
          }
        });

        await this.prisma.outboundQueue.update({
          where: { id: item.id },
          data: { status: 'completed' }
        });

        emitMessageNew(item.conversationId, message);
      } catch (err: any) {
        await this.prisma.outboundQueue.update({
          where: { id: item.id },
          data: { status: 'failed', lastError: err?.message || 'unknown' }
        });
      }
    }
  }
}