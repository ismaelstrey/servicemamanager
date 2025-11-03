import express, { Request, Response } from 'express';
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
import notificationRoutes from './routes/notificationRoutes';
import clientProfileRoutes from './routes/clientProfileRoutes';
import customerAuthRoutes from './routes/customerAuthRoutes';
import clientServiceOrderRoutes from './routes/clientServiceOrderRoutes';
import clientTicketRoutes from './routes/clientTicketRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import { generalRateLimit, authRateLimit, aiRateLimit, createResourceRateLimit } from './middleware/rateLimitMiddleware';
import { corsMiddleware, restrictiveCorsMiddleware, publicCorsMiddleware, validateCorsConfig } from './middleware/corsMiddleware';
import { redisClient } from './config/redis';
import { requestLogger } from './middleware/requestLogger';

// Configura variáveis de ambiente
dotenv.config();

const app = express();
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
app.use('/api/client/profile', clientProfileRoutes);

// Rate limiting específico para criação de recursos
app.use('/api/service-orders', createResourceRateLimit);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/client/service-orders', createResourceRateLimit);
app.use('/api/client/service-orders', clientServiceOrderRoutes);
app.use('/api/client/tickets', clientTicketRoutes);

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

app.listen(port, async () => {
  // Log do servidor iniciado
  console.log(`Servidor iniciado na porta ${port}`);
  
  // Inicializa Redis de forma assíncrona
  await initializeRedis();
});