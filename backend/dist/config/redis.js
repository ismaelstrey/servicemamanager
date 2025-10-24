"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Habilitação do Redis controlada por env
const isRedisEnabled = () => {
    const flag = process.env.REDIS_ENABLED;
    if (typeof flag !== 'undefined') {
        return flag === 'true';
    }
    // Se não houver REDIS_ENABLED explícito, habilita apenas quando REDIS_URL estiver definido
    return !!process.env.REDIS_URL && process.env.REDIS_URL.trim().length > 0;
};
// Configuração do Redis baseada no ambiente
const getRedisConfig = () => {
    const environment = process.env.NODE_ENV || 'development';
    switch (environment) {
        case 'production':
            return {
                url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
                password: process.env.REDIS_PASSWORD,
                socket: {
                    connectTimeout: 60000,
                    lazyConnect: true,
                    // Evita tentativas de reconexão infinitas quando indisponível
                    reconnectStrategy: (_retries) => false,
                },
                retryDelayOnFailover: 100,
                enableReadyCheck: true,
                maxRetriesPerRequest: 3,
            };
        case 'staging':
            return {
                url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
                password: process.env.REDIS_PASSWORD,
                socket: {
                    connectTimeout: 30000,
                    lazyConnect: true,
                    reconnectStrategy: (_retries) => false,
                },
                retryDelayOnFailover: 100,
                enableReadyCheck: true,
                maxRetriesPerRequest: 2,
            };
        default: // development
            return {
                url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
                password: process.env.REDIS_PASSWORD,
                socket: {
                    connectTimeout: 10000,
                    lazyConnect: true,
                    reconnectStrategy: (_retries) => false,
                },
                retryDelayOnFailover: 50,
                enableReadyCheck: false,
                maxRetriesPerRequest: 1,
            };
    }
};
// Cliente Redis singleton
class RedisClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionAttempted = false;
        // Cliente será criado apenas quando necessário
    }
    createClient() {
        if (!isRedisEnabled()) {
            console.log('Redis desativado (defina REDIS_ENABLED=true para habilitar)');
            return;
        }
        if (!this.client) {
            const config = getRedisConfig();
            this.client = (0, redis_1.createClient)(config);
            // Event listeners
            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                console.log('Redis Client Connected');
                this.isConnected = true;
            });
            this.client.on('ready', () => {
                console.log('Redis Client Ready');
                this.isConnected = true;
            });
            this.client.on('end', () => {
                console.log('Redis Client Disconnected');
                this.isConnected = false;
            });
        }
    }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }
    async connect() {
        if (!isRedisEnabled()) {
            return; // Pula conexão quando desativado
        }
        if (!this.connectionAttempted) {
            this.connectionAttempted = true;
            try {
                this.createClient();
                if (this.client) {
                    await this.client.connect();
                }
            }
            catch (error) {
                console.error('Failed to connect to Redis:', error);
                console.warn('Redis connection failed, continuing without cache');
                // Não lança erro para permitir que a aplicação continue sem Redis
                this.isConnected = false;
                this.client = null; // Limpa o cliente para evitar tentativas futuras
            }
        }
    }
    async disconnect() {
        if (this.isConnected && this.client) {
            await this.client.disconnect();
        }
    }
    getClient() {
        return this.client;
    }
    isClientConnected() {
        return this.isConnected;
    }
    // Métodos de conveniência para operações comuns
    async get(key) {
        if (!this.isConnected || !this.client) {
            console.warn('Redis not connected, skipping get operation');
            return null;
        }
        return await this.client.get(key);
    }
    async set(key, value, ttl) {
        if (!this.isConnected || !this.client) {
            console.warn('Redis not connected, skipping set operation');
            return;
        }
        if (ttl) {
            await this.client.setEx(key, ttl, value);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        if (!this.isConnected || !this.client) {
            console.warn('Redis not connected, skipping delete operation');
            return;
        }
        await this.client.del(key);
    }
    async exists(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        const result = await this.client.exists(key);
        return result === 1;
    }
    async flushAll() {
        if (!this.isConnected || !this.client) {
            console.warn('Redis not connected, skipping flush operation');
            return;
        }
        await this.client.flushAll();
    }
}
// Exporta a instância singleton
exports.redisClient = RedisClient.getInstance();
exports.default = exports.redisClient;
