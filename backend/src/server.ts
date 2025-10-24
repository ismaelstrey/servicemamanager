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
import swaggerUi from 'swagger-ui-express';
import openapiSpec from './docs/openapi';
import { generalRateLimit, authRateLimit, aiRateLimit, createResourceRateLimit } from './middleware/rateLimitMiddleware';
import { corsMiddleware, restrictiveCorsMiddleware, publicCorsMiddleware, validateCorsConfig } from './middleware/corsMiddleware';
import { redisClient } from './config/redis';

// Configura variáveis de ambiente
dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 4000;

// Valida configuração de CORS
validateCorsConfig();

// Middlewares globais
app.use(corsMiddleware);
app.use(express.json());

// Rate limiting geral para todas as rotas da API
app.use('/api', generalRateLimit);

// Rate limiting específico para autenticação
app.use('/auth', authRateLimit);
app.use('/api/client/auth', authRateLimit);

app.use('/auth', authRoutes);
app.use('/api/client/auth', customerAuthRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/providers', equipmentRoutes);
app.use('/api/providers', ticketRoutes);
app.use('/api/providers', passwordVaultRoutes);
app.use('/api/providers', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/client/profile', clientProfileRoutes);

// Rate limiting específico para criação de recursos
app.use('/api/service-orders', createResourceRateLimit);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/client/service-orders', createResourceRateLimit);
app.use('/api/client/service-orders', clientServiceOrderRoutes);

// Rotas de comentários
app.use('/api/comments', commentRoutes);

// Rate limiting específico para IA
app.use('/api/ai', aiRateLimit);
app.use('/api/ai', aiRoutes);

// Documentação Swagger (CORS público para permitir acesso)
app.use('/docs', publicCorsMiddleware, swaggerUi.serve, swaggerUi.setup(openapiSpec));

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