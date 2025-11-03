"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
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
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const clientProfileRoutes_1 = __importDefault(require("./routes/clientProfileRoutes"));
const customerAuthRoutes_1 = __importDefault(require("./routes/customerAuthRoutes"));
const clientServiceOrderRoutes_1 = __importDefault(require("./routes/clientServiceOrderRoutes"));
const clientTicketRoutes_1 = __importDefault(require("./routes/clientTicketRoutes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./docs/swagger"));
const rateLimitMiddleware_1 = require("./middleware/rateLimitMiddleware");
const corsMiddleware_1 = require("./middleware/corsMiddleware");
const redis_1 = require("./config/redis");
const requestLogger_1 = require("./middleware/requestLogger");
// Configura variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
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
app.use('/api/client/profile', clientProfileRoutes_1.default);
// Rate limiting específico para criação de recursos
app.use('/api/service-orders', rateLimitMiddleware_1.createResourceRateLimit);
app.use('/api/service-orders', serviceOrderRoutes_1.default);
app.use('/api/client/service-orders', rateLimitMiddleware_1.createResourceRateLimit);
app.use('/api/client/service-orders', clientServiceOrderRoutes_1.default);
app.use('/api/client/tickets', clientTicketRoutes_1.default);
// Rotas de comentários
app.use('/api/comments', commentRoutes_1.default);
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
app.listen(port, async () => {
    // Log do servidor iniciado
    console.log(`Servidor iniciado na porta ${port}`);
    // Inicializa Redis de forma assíncrona
    await initializeRedis();
});
