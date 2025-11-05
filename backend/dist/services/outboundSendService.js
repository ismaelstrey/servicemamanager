"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundSendService = void 0;
const prisma_1 = require("../lib/prisma");
const socketPublisher_1 = require("../events/socketPublisher");
const sender_1 = require("../integrations/telegram/sender");
class OutboundSendService {
    constructor() {
        this.prisma = prisma_1.prisma;
    }
    async processQueueItem(queueId) {
        const item = await this.prisma.outboundQueue.findUnique({
            where: { id: queueId },
            include: { integration: { select: { id: true } } }
        });
        if (!item)
            throw new Error(`OutboundQueue item ${queueId} não encontrado`);
        if (item.status === 'completed')
            return;
        await this.prisma.outboundQueue.update({ where: { id: item.id }, data: { status: 'processing' } });
        try {
            const payload = item.payload || {};
            const content = payload?.message || '';
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
                if (!chatId)
                    throw new Error('chatId obrigatório para envio Telegram');
                const photoUrl = payload?.photoUrl || undefined;
                const documentUrl = payload?.documentUrl || undefined;
                const caption = payload?.caption || undefined;
                if (documentUrl) {
                    await (0, sender_1.sendDocument)(chatId, documentUrl, caption ?? content);
                }
                else if (photoUrl) {
                    await (0, sender_1.sendPhoto)(chatId, photoUrl, caption ?? content);
                }
                else {
                    await (0, sender_1.sendMessage)(chatId, content);
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
            (0, socketPublisher_1.emitMessageNew)(item.conversationId, message);
        }
        catch (err) {
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
                const payload = item.payload || {};
                const content = payload?.message || '';
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
                (0, socketPublisher_1.emitMessageNew)(item.conversationId, message);
            }
            catch (err) {
                await this.prisma.outboundQueue.update({
                    where: { id: item.id },
                    data: { status: 'failed', lastError: err?.message || 'unknown' }
                });
            }
        }
    }
}
exports.OutboundSendService = OutboundSendService;
