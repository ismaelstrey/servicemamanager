import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

// Configura variáveis de ambiente
dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 4000;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

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