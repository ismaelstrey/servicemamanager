"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const providerRoutes_1 = __importDefault(require("./routes/providerRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const passwordVaultRoutes_1 = __importDefault(require("./routes/passwordVaultRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const serviceOrderRoutes_1 = __importDefault(require("./routes/serviceOrderRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const clientProfileRoutes_1 = __importDefault(require("./routes/clientProfileRoutes"));
const customerAuthRoutes_1 = __importDefault(require("./routes/customerAuthRoutes"));
const clientServiceOrderRoutes_1 = __importDefault(require("./routes/clientServiceOrderRoutes"));
const clientTicketRoutes_1 = __importDefault(require("./routes/clientTicketRoutes"));
const clientNotificationRoutes_1 = __importDefault(require("./routes/clientNotificationRoutes"));
const integrationRoutes_1 = __importDefault(require("./routes/integrationRoutes"));
const debugRoutes_1 = __importDefault(require("./routes/debugRoutes"));
const widgetRoutes_1 = __importDefault(require("./routes/widgetRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const checklistRoutes_1 = __importDefault(require("./routes/checklistRoutes"));
const routineRoutes_1 = __importDefault(require("./routes/routineRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./docs/swagger"));
const rateLimitMiddleware_1 = require("./middleware/rateLimitMiddleware");
const corsMiddleware_1 = require("./middleware/corsMiddleware");
const redis_1 = require("./config/redis");
const requestLogger_1 = require("./middleware/requestLogger");
const metricsMiddleware_1 = require("./middleware/metricsMiddleware");
const jwtUtils_1 = require("./utils/jwtUtils");
const prisma_1 = require("./lib/prisma");
const webhookProcessor_1 = require("./workers/webhookProcessor");
const outboundSender_1 = require("./workers/outboundSender");
const outboundBullWorker_1 = require("./workers/outboundBullWorker");
const mediaPurge_1 = require("./workers/mediaPurge");
const backupWorker_1 = require("./workers/backupWorker");
const socketPublisher_1 = require("./events/socketPublisher");
const privacyRoutes_1 = __importDefault(require("./routes/privacyRoutes"));
const tracing_1 = require("./lib/tracing");
// Configura variáveis de ambiente
dotenv_1.default.config();
// Inicializa tracing (OpenTelemetry) se habilitado
(0, tracing_1.startTracing)();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// use shared prisma instance
// Usa porta fixa em desenvolvimento (ignora PORT), e respeita PORT em produção
const port = process.env.NODE_ENV === 'production'
    ? Number(process.env.PORT) || 4002
    : 4002;
// Valida configuração de CORS
(0, corsMiddleware_1.validateCorsConfig)();
// Middlewares globais
app.use('/api', corsMiddleware_1.corsMiddleware);
app.use(express_1.default.json());
// Log de requisições (apenas em desenvolvimento)
app.use('/api', requestLogger_1.requestLogger);
// Métricas HTTP (Prometheus)
app.use('/api', metricsMiddleware_1.metricsMiddleware);
// Rate limiting geral para todas as rotas da API
app.use('/api', rateLimitMiddleware_1.generalRateLimit);
// Rate limiting específico para autenticação
app.use('/api/auth', rateLimitMiddleware_1.authRateLimit);
app.use('/api/client/auth', rateLimitMiddleware_1.authRateLimit);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/client/auth', customerAuthRoutes_1.default);
app.use('/api/providers', providerRoutes_1.default);
app.use('/api/providers', equipmentRoutes_1.default);
app.use('/api/providers', ticketRoutes_1.default);
// Também expõe rotas de tickets sem prefixo de provider (ex.: /api/tickets/kanban)
app.use('/api', ticketRoutes_1.default);
app.use('/api/providers', passwordVaultRoutes_1.default);
app.use('/api/providers', notificationRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/customers', customerRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/client/profile', clientProfileRoutes_1.default);
app.use('/api/integrations', integrationRoutes_1.default);
// Rotas de privacidade (consentimento e solicitação de eliminação de dados)
app.use('/api/privacy', privacyRoutes_1.default);
// Rotas de debug (habilitar via ENABLE_DEBUG_ROUTES=true)
app.use('/api/debug', debugRoutes_1.default);
// Chat interno (Fase 3.2)
app.use('/api/chat', chatRoutes_1.default);
// Rotas públicas do widget de chat (sem auth)
app.use('/chat', widgetRoutes_1.default);
// Rate limiting específico para criação de recursos
app.use('/api/service-orders', rateLimitMiddleware_1.createResourceRateLimit);
app.use('/api/service-orders', serviceOrderRoutes_1.default);
app.use('/api/client/service-orders', rateLimitMiddleware_1.createResourceRateLimit);
app.use('/api/client/service-orders', clientServiceOrderRoutes_1.default);
app.use('/api/client/tickets', clientTicketRoutes_1.default);
app.use('/api/client/notifications', clientNotificationRoutes_1.default);
// Rotas de comentários
app.use('/api/comments', commentRoutes_1.default);
// Checklists
app.use('/api', checklistRoutes_1.default);
// Rotinas
app.use('/api', routineRoutes_1.default);
// Rate limiting específico para IA
app.use('/api/ai', rateLimitMiddleware_1.aiRateLimit);
app.use('/api/ai', aiRoutes_1.default);
// Documentação Swagger (CORS público para permitir acesso)
app.use('/docs', corsMiddleware_1.publicCorsMiddleware, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// Rota de saúde (CORS público)
app.get('/health', corsMiddleware_1.publicCorsMiddleware, (_req, res) => {
    // Retorna status do servidor
    res.json({ status: 'ok' });
});
// Rota de métricas para Prometheus
app.get('/metrics', metricsMiddleware_1.metricsRouteHandler);
// TODO: Registrar rotas em src/routes
// Inicializa conexão com Redis
const initializeRedis = async () => {
    try {
        await redis_1.redisClient.connect();
        if (redis_1.redisClient.isClientConnected()) {
            console.log('Redis conectado com sucesso');
        }
        else {
            console.log('Redis desativado ou indisponível; cache Redis não será usado');
        }
    }
    catch (error) {
        console.warn('Falha ao conectar com Redis:', error);
        console.warn('Aplicação continuará sem cache Redis');
        // Não bloqueia a inicialização do servidor
    }
};
// Configuração Socket.IO com autenticação JWT e namespaces por provider
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
// Middleware global de autenticação via JWT
io.use((socket, next) => {
    try {
        const authHeader = socket.handshake.headers['authorization'];
        const bearer = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : undefined;
        const token = socket.handshake.auth?.token || socket.handshake.query?.token || bearer;
        if (!token || typeof token !== 'string') {
            return next(new Error('Unauthorized: token ausente'));
        }
        const payload = (0, jwtUtils_1.verifyToken)(token);
        socket.data.userId = payload.userId;
        socket.data.customerId = payload.customerId;
        socket.data.providerId = payload.providerId;
        socket.data.role = payload.role;
        next();
    }
    catch (err) {
        next(new Error('Unauthorized: token inválido'));
    }
});
// Namespace dinâmico por provider: /providers/{providerId}
const providerNs = io.of(/^\/providers\/\d+$/);
providerNs.use((socket, next) => {
    try {
        const nsName = socket.nsp.name; // ex.: /providers/123
        const parts = nsName.split('/');
        const nsProviderId = Number(parts[2]);
        const tokenProviderId = Number(socket.data.providerId);
        if (!tokenProviderId) {
            return next(new Error('Forbidden: providerId ausente no token'));
        }
        if (nsProviderId !== tokenProviderId) {
            return next(new Error('Forbidden: namespace não corresponde ao providerId'));
        }
        next();
    }
    catch (err) {
        next(new Error('Forbidden: falha ao validar namespace'));
    }
});
providerNs.on('connection', (socket) => {
    const nsName = socket.nsp.name;
    console.log(`[WS] Conectado ao namespace ${nsName} — socket ${socket.id} (userId=${socket.data.userId}, role=${socket.data.role})`);
    // Entrar em uma conversa (room por conversa)
    socket.on('conversation:join', async (payload, ack) => {
        try {
            const conversationId = Number(payload?.conversationId);
            if (!conversationId) {
                ack?.({ success: false, error: 'conversationId inválido' });
                return;
            }
            const userId = socket.data.userId;
            if (!userId) {
                ack?.({ success: false, error: 'Não autenticado' });
                return;
            }
            // Garante participação do agente na conversa
            const member = await prisma_1.prisma.participant.findFirst({
                where: { conversationId, role: 'agent', externalId: String(userId) },
                select: { id: true }
            });
            if (!member) {
                await prisma_1.prisma.participant.create({
                    data: {
                        conversationId,
                        role: 'agent',
                        externalId: String(userId)
                    }
                });
            }
            const room = `conv:${conversationId}`;
            await socket.join(room);
            providerNs.to(room).emit('presence', { conversationId, userId, status: 'online' });
            ack?.({ success: true });
        }
        catch (err) {
            ack?.({ success: false, error: 'Falha ao entrar na conversa' });
        }
    });
    // Sair da conversa
    socket.on('conversation:leave', async (payload) => {
        const conversationId = Number(payload?.conversationId);
        if (!conversationId)
            return;
        const room = `conv:${conversationId}`;
        await socket.leave(room);
        providerNs.to(room).emit('presence', { conversationId, userId: socket.data.userId, status: 'offline' });
    });
    // Indicar digitando
    socket.on('typing', (payload) => {
        const conversationId = Number(payload?.conversationId);
        if (!conversationId)
            return;
        const room = `conv:${conversationId}`;
        providerNs.to(room).emit('typing', { conversationId, userId: socket.data.userId, isTyping: !!payload?.isTyping });
    });
    // Nova mensagem
    socket.on('message:new', async (payload, ack) => {
        try {
            const convId = Number(payload?.conversationId);
            const content = payload?.content;
            if (!convId || !content) {
                ack?.({ success: false, error: 'Dados inválidos' });
                return;
            }
            const userId = socket.data.userId;
            if (!userId) {
                ack?.({ success: false, error: 'Não autenticado' });
                return;
            }
            let participant = await prisma_1.prisma.participant.findFirst({ where: { conversationId: convId, role: 'agent', externalId: String(userId) } });
            if (!participant) {
                participant = await prisma_1.prisma.participant.create({ data: { conversationId: convId, role: 'agent', externalId: String(userId) } });
            }
            const message = await prisma_1.prisma.message.create({
                data: {
                    conversationId: convId,
                    participantId: participant.id,
                    direction: 'outbound',
                    content,
                    mimeType: payload?.mimeType || null,
                    status: 'sent'
                }
            });
            const room = `conv:${convId}`;
            providerNs.to(room).emit('message:new', { message });
            providerNs.to(room).emit('message:delivered', { messageId: message.id, conversationId: convId });
            ack?.({ success: true, data: message });
        }
        catch (err) {
            ack?.({ success: false, error: 'Falha ao enviar mensagem' });
        }
    });
    // Marcar mensagem como lida
    socket.on('message:read', async (payload) => {
        const messageId = Number(payload?.messageId);
        if (!messageId)
            return;
        try {
            const updated = await prisma_1.prisma.message.update({ where: { id: messageId }, data: { status: 'read' } });
            providerNs.emit('message:read', { messageId: updated.id, conversationId: updated.conversationId });
        }
        catch (err) {
            // Silencioso
        }
    });
    socket.on('disconnect', (reason) => {
        console.log(`[WS] Desconectado de ${nsName} — socket ${socket.id}, reason=${reason}`);
    });
});
server.listen(port, async () => {
    // Log do servidor iniciado
    console.log(`Servidor iniciado na porta ${port}`);
    // Inicializa Redis de forma assíncrona
    await initializeRedis();
    // Inicializa worker de processamento de webhooks (controlado por env)
    await (0, webhookProcessor_1.startWebhookProcessor)();
    // Inicializa worker de envio outbound (BullMQ quando habilitado)
    const bullEnabled = (process.env.OUTBOUND_BULLMQ_ENABLED || 'false').toLowerCase() === 'true';
    if (bullEnabled) {
        await (0, outboundBullWorker_1.startOutboundBullWorker)();
    }
    else {
        await (0, outboundSender_1.startOutboundSender)();
    }
    // Inicializa expurgo de mídia
    await (0, mediaPurge_1.startMediaPurge)();
    // Inicializa worker de backup
    await (0, backupWorker_1.startBackupWorker)();
    // Disponibiliza namespace para publicadores de eventos
    (0, socketPublisher_1.setProviderNamespace)(providerNs);
});
