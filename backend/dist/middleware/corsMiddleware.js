"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCorsConfig = exports.publicCorsMiddleware = exports.restrictiveCorsMiddleware = exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
// Definir origens permitidas baseadas no ambiente
const getAllowedOrigins = () => {
    const environment = process.env.NODE_ENV || 'development';
    switch (environment) {
        case 'production':
            // Em produção, apenas origens específicas são permitidas
            return [
                process.env.FRONTEND_URL || 'https://telecomai.com',
                process.env.ADMIN_PANEL_URL || 'https://admin.telecomai.com',
                // Adicione outras origens de produção conforme necessário
            ].filter(Boolean); // Remove valores undefined/null
        case 'staging':
            return [
                process.env.STAGING_FRONTEND_URL || 'https://staging.telecomai.com',
                process.env.STAGING_ADMIN_URL || 'https://staging-admin.telecomai.com',
                'http://localhost:3000', // Para testes locais contra staging
                'http://localhost:5173', // Vite dev server
            ].filter(Boolean);
        case 'development':
        default:
            // Em desenvolvimento, permite origens locais comuns
            return [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:5173', // Vite
                'http://localhost:8080', // Vue CLI
                'http://127.0.0.1:3000',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:6379',
                // Adicione outras portas de desenvolvimento conforme necessário
            ];
    }
};
// Configuração de CORS baseada no ambiente
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();
        const environment = process.env.NODE_ENV || 'development';
        // Em desenvolvimento, permite requisições sem origin (ex: Postman, aplicações mobile)
        if (environment === 'development' && !origin) {
            return callback(null, true);
        }
        // Verifica se a origin está na lista de permitidas
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`CORS: Origin '${origin}' não permitida. Origens permitidas:`, allowedOrigins);
            callback(new Error(`Origin '${origin}' não permitida pelo CORS`), false);
        }
    },
    // Métodos HTTP permitidos
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Headers permitidos
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma',
        'X-API-Key',
        'X-Client-Version'
    ],
    // Headers expostos para o cliente
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Rate-Limit-Remaining',
        'X-Rate-Limit-Reset'
    ],
    // Permitir cookies e credenciais
    credentials: true,
    // Cache do preflight em segundos (24 horas em produção, 1 hora em desenvolvimento)
    maxAge: process.env.NODE_ENV === 'production' ? 86400 : 3600,
    // Não incluir status 204 para OPTIONS em produção (alguns proxies não gostam)
    optionsSuccessStatus: process.env.NODE_ENV === 'production' ? 200 : 204,
    // Pré-flight para requisições complexas
    preflightContinue: false
};
// Middleware de CORS configurado
exports.corsMiddleware = (0, cors_1.default)(corsOptions);
// Middleware de CORS mais restritivo para rotas sensíveis (auth, admin, etc.)
exports.restrictiveCorsMiddleware = (0, cors_1.default)({
    ...corsOptions,
    origin: (origin, callback) => {
        const environment = process.env.NODE_ENV || 'development';
        // Em produção, apenas origens específicas para rotas sensíveis
        const restrictiveOrigins = environment === 'production'
            ? [
                process.env.FRONTEND_URL || 'https://telecomai.com',
                process.env.ADMIN_PANEL_URL || 'https://admin.telecomai.com'
            ].filter(Boolean)
            : getAllowedOrigins();
        // Não permite requisições sem origin em rotas sensíveis, mesmo em desenvolvimento
        if (!origin) {
            return callback(new Error('Origin obrigatória para esta rota'), false);
        }
        if (restrictiveOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`CORS Restritivo: Origin '${origin}' não permitida para rota sensível`);
            callback(new Error(`Origin '${origin}' não permitida para esta rota sensível`), false);
        }
    },
    // Headers mais restritivos para rotas sensíveis
    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ],
    // Apenas métodos essenciais
    methods: ['POST', 'GET'],
    // Cache menor para rotas sensíveis
    maxAge: 3600 // 1 hora
});
// Middleware para rotas públicas (webhooks, health check, etc.)
exports.publicCorsMiddleware = (0, cors_1.default)({
    origin: '*', // Permite qualquer origin para rotas públicas
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'X-Requested-With',
        'X-API-Key'
    ],
    credentials: false, // Não permite credenciais em rotas públicas
    maxAge: 86400 // 24 horas
});
// Função para validar configuração de CORS
const validateCorsConfig = () => {
    const environment = process.env.NODE_ENV || 'development';
    const allowedOrigins = getAllowedOrigins();
    console.log(`🔒 CORS configurado para ambiente: ${environment}`);
    console.log(`🌐 Origens permitidas:`, allowedOrigins);
    if (environment === 'production') {
        // Validações específicas para produção
        if (!process.env.FRONTEND_URL) {
            console.warn('⚠️  FRONTEND_URL não definida para produção');
        }
        if (allowedOrigins.some(origin => origin.includes('localhost'))) {
            console.warn('⚠️  Origens localhost detectadas em produção!');
        }
    }
    if (allowedOrigins.length === 0) {
        console.error('❌ Nenhuma origem CORS configurada!');
    }
};
exports.validateCorsConfig = validateCorsConfig;
