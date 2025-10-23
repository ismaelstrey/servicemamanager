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
import aiRoutes from './routes/aiRoutes';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from './docs/openapi';
import { generalRateLimit } from './middlewares/rateLimitMiddleware';

// Configura variáveis de ambiente
dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 4000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rate limiting geral para todas as rotas da API
app.use('/api', generalRateLimit);

app.use('/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/providers', equipmentRoutes);
app.use('/api/providers', ticketRoutes);
app.use('/api/providers', passwordVaultRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/ai', aiRoutes);

// Documentação Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Rota de saúde
app.get('/health', (_req: Request, res: Response) => {
  // Retorna status do servidor
  res.json({ status: 'ok' });
});

// TODO: Registrar rotas em src/routes

app.listen(port, () => {
  // Log do servidor iniciado
  console.log(`Servidor iniciado na porta ${port}`);
});