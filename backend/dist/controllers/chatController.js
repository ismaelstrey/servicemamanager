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
exports.chatController = exports.ChatController = void 0;
const prisma_1 = require("../lib/prisma");
// usar prisma centralizado do lib
class ChatController {
    async listConversations(req, res) {
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
            };
            const [items, total] = await Promise.all([
                prisma_1.prisma.conversation.findMany({
                    where,
                    orderBy: { updatedAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma_1.prisma.conversation.count({ where })
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar conversas';
            res.status(500).json({ success: false, message });
        }
    }
    async createConversation(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const { title, channelId } = (req.body || {});
            let resolvedChannelId = channelId;
            if (!resolvedChannelId) {
                const siteChannel = await prisma_1.prisma.channel.findFirst({
                    where: { type: 'site', isActive: true },
                    select: { id: true }
                });
                if (!siteChannel) {
                    res.status(400).json({ success: false, message: 'Nenhum canal ativo encontrado' });
                    return;
                }
                resolvedChannelId = siteChannel.id;
            }
            const conversation = await prisma_1.prisma.conversation.create({
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar conversa';
            res.status(500).json({ success: false, message });
        }
    }
    async listMessages(req, res) {
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
            const member = await prisma_1.prisma.participant.findFirst({
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
                prisma_1.prisma.message.findMany({
                    where: { conversationId },
                    orderBy: { createdAt: 'asc' },
                    skip,
                    take: limit
                }),
                prisma_1.prisma.message.count({ where: { conversationId } })
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao listar mensagens';
            res.status(500).json({ success: false, message });
        }
    }
    async createMessage(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const { conversationId, content, mimeType } = (req.body || {});
            const convId = parseInt(String(conversationId));
            if (!convId || isNaN(convId)) {
                res.status(400).json({ success: false, message: 'conversationId inválido' });
                return;
            }
            if (!content || typeof content !== 'string') {
                res.status(400).json({ success: false, message: 'Conteúdo da mensagem obrigatório' });
                return;
            }
            let participant = await prisma_1.prisma.participant.findFirst({
                where: { conversationId: convId, role: 'agent', externalId: String(userId) }
            });
            if (!participant) {
                participant = await prisma_1.prisma.participant.create({
                    data: {
                        conversationId: convId,
                        role: 'agent',
                        externalId: String(userId),
                        displayName: req.user?.name || null
                    }
                });
            }
            const message = await prisma_1.prisma.message.create({
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
            res.status(500).json({ success: false, message });
        }
    }
    async uploadAttachment(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Não autenticado' });
                return;
            }
            const { conversationId } = (req.body || {});
            const convId = parseInt(String(conversationId));
            if (!convId || isNaN(convId)) {
                res.status(400).json({ success: false, message: 'conversationId inválido' });
                return;
            }
            const file = req.file;
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
            let participant = await prisma_1.prisma.participant.findFirst({
                where: { conversationId: convId, role: 'agent', externalId: String(userId) }
            });
            if (!participant) {
                participant = await prisma_1.prisma.participant.create({
                    data: {
                        conversationId: convId,
                        role: 'agent',
                        externalId: String(userId),
                        displayName: req.user?.name || null
                    }
                });
            }
            // Upload para S3/MinIO
            const { uploadBuffer } = await Promise.resolve().then(() => __importStar(require('../services/storageService')));
            const safeName = (file.originalname || 'arquivo').replace(/[^a-zA-Z0-9_.-]/g, '_');
            const key = `attachments/${convId}/${Date.now()}_${safeName}`;
            const { url } = await uploadBuffer(key, file.buffer, file.mimetype);
            const message = await prisma_1.prisma.message.create({
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao enviar anexo';
            res.status(500).json({ success: false, message });
        }
    }
}
exports.ChatController = ChatController;
exports.chatController = new ChatController();
