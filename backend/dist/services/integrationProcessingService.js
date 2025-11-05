"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationProcessingService = void 0;
const prisma_1 = require("../lib/prisma");
const normalizers_1 = require("../integrations/whatsapp/normalizers");
const normalizers_2 = require("../integrations/telegram/normalizers");
const socketPublisher_1 = require("../events/socketPublisher");
class IntegrationProcessingService {
    constructor() {
        this.prisma = prisma_1.prisma;
    }
    async processPending(limit = 20) {
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
                const provider = evt.integration?.metadata?.provider || evt.integration?.channel?.type;
                const normalized = await this.normalizeEvent(provider, evt.payload);
                await this.persistNormalizedMessage(provider, evt.integrationAccountId, evt.integration?.channel?.id, normalized);
                await this.prisma.webhookEvent.update({
                    where: { id: evt.id },
                    data: { processed: true, processedAt: new Date(), errorMessage: null }
                });
                processed++;
            }
            catch (err) {
                await this.prisma.webhookEvent.update({
                    where: { id: evt.id },
                    data: { processed: false, errorMessage: err?.message || String(err) }
                });
                failed++;
            }
        }
        return { processed, failed };
    }
    async normalizeEvent(provider, payload) {
        const key = String(provider || '').toLowerCase();
        if (key.includes('evolution')) {
            return (0, normalizers_1.normalizeEvolution)(payload);
        }
        else if (key.includes('watiicket') || key.includes('waticket')) {
            return (0, normalizers_1.normalizeWatiicket)(payload);
        }
        else if (key.includes('telegram')) {
            return await (0, normalizers_2.normalizeTelegram)(payload);
        }
        // Fallback para Evolution
        return (0, normalizers_1.normalizeEvolution)(payload);
    }
    async persistNormalizedMessage(provider, integrationAccountId, channelId, msg) {
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
                if (!res.ok)
                    throw new Error(`Falha ao baixar mídia: ${res.status}`);
                const arrayBuffer = await res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const mime = msg.mimeType || res.headers.get('content-type') || 'application/octet-stream';
                const ext = (mime.includes('image/') && mime.split('/')[1]) || (mime.includes('application/') && 'bin') || 'bin';
                const providerKey = String(provider || '').toLowerCase().includes('telegram') ? 'telegram' : 'whatsapp';
                const key = `${providerKey}/${conv.id}/${message.id}-${Date.now()}.${ext}`;
                const { uploadBuffer } = await Promise.resolve().then(() => __importStar(require('./storageService')));
                const stored = await uploadBuffer(key, buffer, mime);
                await this.prisma.attachment.create({ data: { messageId: message.id, url: stored.url, mimeType: mime, size: buffer.length } });
            }
            catch (err) {
                console.warn('[Media] Falha ao processar mídia inbound', err);
            }
        }
        // Emitir evento via WebSocket para atualizar ChatPage em tempo real
        (0, socketPublisher_1.emitMessageNew)(conv.id, message);
    }
}
exports.IntegrationProcessingService = IntegrationProcessingService;
