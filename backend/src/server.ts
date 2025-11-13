import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket, DisconnectReason } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import providerRoutes from './routes/providerRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import ticketRoutes from './routes/ticketRoutes';
import passwordVaultRoutes from './routes/passwordVaultRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import serviceOrderRoutes from './routes/serviceOrderRoutes';
import commentRoutes from './routes/commentRoutes';
import aiRoutes from './routes/aiRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import clientProfileRoutes from './routes/clientProfileRoutes';
import customerAuthRoutes from './routes/customerAuthRoutes';
import clientServiceOrderRoutes from './routes/clientServiceOrderRoutes';
import clientTicketRoutes from './routes/clientTicketRoutes';
import clientNotificationRoutes from './routes/clientNotificationRoutes';
import integrationRoutes from './routes/integrationRoutes';
import debugRoutes from './routes/debugRoutes';
import widgetRoutes from './routes/widgetRoutes';
import reportRoutes from './routes/reportRoutes';
import customerRoutes from './routes/customerRoutes';
import userRoutes from './routes/userRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import { generalRateLimit, authRateLimit, aiRateLimit, createResourceRateLimit } from './middleware/rateLimitMiddleware';
import { corsMiddleware, restrictiveCorsMiddleware, publicCorsMiddleware, validateCorsConfig } from './middleware/corsMiddleware';
import { redisClient } from './config/redis';
import { requestLogger } from './middleware/requestLogger';
import { metricsMiddleware, metricsRouteHandler } from './middleware/metricsMiddleware';
import { verifyToken } from './utils/jwtUtils';
import { prisma } from './lib/prisma';
import { startWebhookProcessor } from './workers/webhookProcessor';
import { startOutboundSender } from './workers/outboundSender';
import { startOutboundBullWorker } from './workers/outboundBullWorker';
import { startMediaPurge } from './workers/mediaPurge';
import { startBackupWorker } from './workers/backupWorker';
import { setProviderNamespace } from './events/socketPublisher';
import privacyRoutes from './routes/privacyRoutes';
import { startTracing } from './lib/tracing';

// Configura variáveis de ambiente
dotenv.config();

// Inicializa tracing (OpenTelemetry) se habilitado
startTracing();

const app = express();
const server = http.createServer(app);
// use shared prisma instance
// Usa porta fixa em desenvolvimento (ignora PORT), e respeita PORT em produção
const port: number = process.env.NODE_ENV === 'production'
  ? Number(process.env.PORT) || 4002
  : 4002;

// Valida configuração de CORS
validateCorsConfig();

// Middlewares globais
app.use('/api', corsMiddleware);
app.use(express.json());
// Log de requisições (apenas em desenvolvimento)
app.use('/api', requestLogger);
// Métricas HTTP (Prometheus)
app.use('/api', metricsMiddleware);

// Rate limiting geral para todas as rotas da API
app.use('/api', generalRateLimit);

// Rate limiting específico para autenticação
app.use('/api/auth', authRateLimit);
app.use('/api/client/auth', authRateLimit);

app.use('/api/auth', authRoutes);
app.use('/api/client/auth', customerAuthRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/providers', equipmentRoutes);
app.use('/api/providers', ticketRoutes);
// Também expõe rotas de tickets sem prefixo de provider (ex.: /api/tickets/kanban)
app.use('/api', ticketRoutes);
app.use('/api/providers', passwordVaultRoutes);
app.use('/api/providers', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/client/profile', clientProfileRoutes);
app.use('/api/integrations', integrationRoutes);
// Rotas de privacidade (consentimento e solicitação de eliminação de dados)
app.use('/api/privacy', privacyRoutes);
// Rotas de debug (habilitar via ENABLE_DEBUG_ROUTES=true)
app.use('/api/debug', debugRoutes);
// Chat interno (Fase 3.2)
app.use('/api/chat', chatRoutes);
// Rotas públicas do widget de chat (sem auth)
app.use('/chat', widgetRoutes);

// Rate limiting específico para criação de recursos
app.use('/api/service-orders', createResourceRateLimit);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/client/service-orders', createResourceRateLimit);
app.use('/api/client/service-orders', clientServiceOrderRoutes);
app.use('/api/client/tickets', clientTicketRoutes);
app.use('/api/client/notifications', clientNotificationRoutes);

// Rotas de comentários
app.use('/api/comments', commentRoutes);

// Rate limiting específico para IA
app.use('/api/ai', aiRateLimit);
app.use('/api/ai', aiRoutes);

// Documentação Swagger (CORS público para permitir acesso)
app.use('/docs', publicCorsMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota de saúde (CORS público)
app.get('/health', publicCorsMiddleware, (_req: Request, res: Response) => {
  // Retorna status do servidor
  res.json({ status: 'ok' });
});

// Rota de métricas para Prometheus
app.get('/metrics', metricsRouteHandler);

// TODO: Registrar rotas em src/routes

// Inicializa conexão com Redis
const initializeRedis = async () => {
  try {
    await redisClient.connect();
    if (redisClient.isClientConnected()) {
      console.log('Redis conectado com sucesso');
    } else {
      console.log('Redis desativado ou indisponível; cache Redis não será usado');
    }
  } catch (error) {
    console.warn('Falha ao conectar com Redis:', error);
    console.warn('Aplicação continuará sem cache Redis');
    // Não bloqueia a inicialização do servidor
  }
};

// Configuração Socket.IO com autenticação JWT e namespaces por provider
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware global de autenticação via JWT
io.use((socket: Socket, next: (err?: Error) => void) => {
  try {
    const authHeader = socket.handshake.headers['authorization'] as string | undefined;
    const bearer = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;
    const token = socket.handshake.auth?.token || socket.handshake.query?.token || bearer;
    if (!token || typeof token !== 'string') {
      return next(new Error('Unauthorized: token ausente'));
    }
    const payload = verifyToken<{ userId?: number; customerId?: number; providerId?: number; role?: string }>(token);
    socket.data.userId = payload.userId;
    socket.data.customerId = payload.customerId;
    socket.data.providerId = payload.providerId;
    socket.data.role = payload.role;
    next();
  } catch (err) {
    next(new Error('Unauthorized: token inválido'));
  }
});

// Namespace dinâmico por provider: /providers/{providerId}
const providerNs = io.of(/^\/providers\/\d+$/);
providerNs.use((socket: Socket, next: (err?: Error) => void) => {
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
  } catch (err) {
    next(new Error('Forbidden: falha ao validar namespace'));
  }
});

providerNs.on('connection', (socket: Socket) => {
  const nsName = socket.nsp.name;
  console.log(`[WS] Conectado ao namespace ${nsName} — socket ${socket.id} (userId=${socket.data.userId}, role=${socket.data.role})`);

  // Entrar em uma conversa (room por conversa)
  socket.on('conversation:join', async (payload: { conversationId?: number }, ack?: (res: any) => void) => {
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
      const member = await prisma.participant.findFirst({
        where: { conversationId, role: 'agent', externalId: String(userId) },
        select: { id: true }
      });
      if (!member) {
        await prisma.participant.create({
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
    } catch (err) {
      ack?.({ success: false, error: 'Falha ao entrar na conversa' });
    }
  });

  // Sair da conversa
  socket.on('conversation:leave', async (payload: { conversationId?: number }) => {
    const conversationId = Number(payload?.conversationId);
    if (!conversationId) return;
    const room = `conv:${conversationId}`;
    await socket.leave(room);
    providerNs.to(room).emit('presence', { conversationId, userId: socket.data.userId, status: 'offline' });
  });

  // Indicar digitando
  socket.on('typing', (payload: { conversationId?: number; isTyping?: boolean }) => {
    const conversationId = Number(payload?.conversationId);
    if (!conversationId) return;
    const room = `conv:${conversationId}`;
    providerNs.to(room).emit('typing', { conversationId, userId: socket.data.userId, isTyping: !!payload?.isTyping });
  });

  // Nova mensagem
  socket.on('message:new', async (payload: { conversationId?: number; content?: string; mimeType?: string }, ack?: (res: any) => void) => {
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
      let participant = await prisma.participant.findFirst({ where: { conversationId: convId, role: 'agent', externalId: String(userId) } });
      if (!participant) {
        participant = await prisma.participant.create({ data: { conversationId: convId, role: 'agent', externalId: String(userId) } });
      }
      const message = await prisma.message.create({
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
    } catch (err) {
      ack?.({ success: false, error: 'Falha ao enviar mensagem' });
    }
  });

  // Marcar mensagem como lida
  socket.on('message:read', async (payload: { messageId?: number }) => {
    const messageId = Number(payload?.messageId);
    if (!messageId) return;
    try {
      const updated = await prisma.message.update({ where: { id: messageId }, data: { status: 'read' } });
      providerNs.emit('message:read', { messageId: updated.id, conversationId: updated.conversationId });
    } catch (err) {
      // Silencioso
    }
  });

  socket.on('disconnect', (reason: DisconnectReason) => {
    console.log(`[WS] Desconectado de ${nsName} — socket ${socket.id}, reason=${reason}`);
  });
});

server.listen(port, async () => {
  // Log do servidor iniciado
  console.log(`Servidor iniciado na porta ${port}`);
  
  // Inicializa Redis de forma assíncrona
  await initializeRedis();

  // Inicializa worker de processamento de webhooks (controlado por env)
  await startWebhookProcessor();

  // Inicializa worker de envio outbound (BullMQ quando habilitado)
  const bullEnabled = (process.env.OUTBOUND_BULLMQ_ENABLED || 'false').toLowerCase() === 'true';
  if (bullEnabled) {
    await startOutboundBullWorker();
  } else {
    await startOutboundSender();
  }

  // Inicializa expurgo de mídia
  await startMediaPurge();

  // Inicializa worker de backup
  await startBackupWorker();

  // Disponibiliza namespace para publicadores de eventos
  setProviderNamespace(providerNs);
});
