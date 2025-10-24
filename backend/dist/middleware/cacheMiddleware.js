"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateResourceCache = exports.invalidateProviderCache = exports.invalidateUserCache = exports.invalidateCache = exports.serviceOrderCacheMiddleware = exports.ticketCacheMiddleware = exports.equipmentCacheMiddleware = exports.statsCacheMiddleware = exports.dashboardCacheMiddleware = exports.listCacheMiddleware = exports.cacheMiddleware = void 0;
const redis_1 = require("../config/redis");
// Gera chave do cache baseada na requisição
const generateCacheKey = (req, options) => {
    const baseKey = `${options.keyPrefix || 'api'}:${req.method}:${req.originalUrl}`;
    // Adiciona variações baseadas em parâmetros específicos
    if (options.varyBy && options.varyBy.length > 0) {
        const variations = options.varyBy.map(field => {
            if (field === 'userId')
                return req.user?.id || 'anonymous';
            if (field === 'providerId')
                return req.providerId || 'no-provider';
            if (field.startsWith('query.')) {
                const queryField = field.replace('query.', '');
                return req.query[queryField] || 'default';
            }
            if (field.startsWith('params.')) {
                const paramField = field.replace('params.', '');
                return req.params[paramField] || 'default';
            }
            return 'default';
        }).join(':');
        return `${baseKey}:${variations}`;
    }
    // Adiciona query string se existir
    const queryString = new URLSearchParams(req.query).toString();
    if (queryString) {
        return `${baseKey}:${queryString}`;
    }
    return baseKey;
};
// Middleware principal de cache
const cacheMiddleware = (options = {}) => {
    const defaultTTL = options.ttl || 300; // 5 minutos por padrão
    return async (req, res, next) => {
        // Pula cache para métodos que não são GET
        if (req.method !== 'GET' || options.skipCache) {
            return next();
        }
        try {
            const cacheKey = generateCacheKey(req, options);
            // Tenta buscar no cache
            const cachedData = await redis_1.redisClient.get(cacheKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                // Adiciona headers de cache
                res.set({
                    'X-Cache': 'HIT',
                    'X-Cache-Key': cacheKey,
                    'Cache-Control': `public, max-age=${defaultTTL}`
                });
                return res.json(parsedData);
            }
            // Se não encontrou no cache, intercepta a resposta
            const originalJson = res.json;
            res.json = function (data) {
                // Salva no cache apenas se a resposta foi bem-sucedida
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redis_1.redisClient.set(cacheKey, JSON.stringify(data), defaultTTL).catch(err => {
                        console.error('Error saving to cache:', err);
                    });
                }
                // Adiciona headers de cache
                res.set({
                    'X-Cache': 'MISS',
                    'X-Cache-Key': cacheKey,
                    'Cache-Control': `public, max-age=${defaultTTL}`
                });
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            // Em caso de erro no cache, continua sem cache
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
// Middleware específico para listagens com paginação
const listCacheMiddleware = (options = {}) => {
    return (0, exports.cacheMiddleware)({
        ...options,
        ttl: options.ttl || 180, // 3 minutos para listagens
        varyBy: ['userId', 'providerId', 'query.page', 'query.limit', 'query.status', 'query.priority', 'query.startDate', 'query.endDate']
    });
};
exports.listCacheMiddleware = listCacheMiddleware;
// Middleware específico para dados de dashboard
const dashboardCacheMiddleware = (options = {}) => {
    return (0, exports.cacheMiddleware)({
        ...options,
        ttl: options.ttl || 120, // 2 minutos para dashboard
        keyPrefix: 'dashboard',
        varyBy: ['userId', 'providerId']
    });
};
exports.dashboardCacheMiddleware = dashboardCacheMiddleware;
// Middleware específico para estatísticas
const statsCacheMiddleware = (options = {}) => {
    return (0, exports.cacheMiddleware)({
        ...options,
        ttl: options.ttl || 600, // 10 minutos para estatísticas
        keyPrefix: 'stats',
        varyBy: ['userId', 'providerId']
    });
};
exports.statsCacheMiddleware = statsCacheMiddleware;
// Middleware específico para dados de equipamentos
const equipmentCacheMiddleware = (options = {}) => {
    return (0, exports.cacheMiddleware)({
        ...options,
        ttl: options.ttl || 300, // 5 minutos para equipamentos
        keyPrefix: 'equipment',
        varyBy: ['userId', 'providerId', 'params.id']
    });
};
exports.equipmentCacheMiddleware = equipmentCacheMiddleware;
// Middleware específico para tickets
const ticketCacheMiddleware = (options = {}) => {
    return (0, exports.cacheMiddleware)({
        ...options,
        ttl: options.ttl || 120, // 2 minutos para tickets (dados mais dinâmicos)
        keyPrefix: 'ticket',
        varyBy: ['userId', 'providerId', 'params.id', 'query.status']
    });
};
exports.ticketCacheMiddleware = ticketCacheMiddleware;
// Middleware específico para ordens de serviço
const serviceOrderCacheMiddleware = (options = {}) => {
    return (0, exports.cacheMiddleware)({
        ...options,
        ttl: options.ttl || 180, // 3 minutos para ordens de serviço
        keyPrefix: 'service-order',
        varyBy: ['userId', 'providerId', 'params.id', 'query.status']
    });
};
exports.serviceOrderCacheMiddleware = serviceOrderCacheMiddleware;
// Função para invalidar cache por padrão
const invalidateCache = async (pattern) => {
    try {
        if (!redis_1.redisClient.isClientConnected()) {
            console.warn('Redis not connected, skipping cache invalidation');
            return;
        }
        const client = redis_1.redisClient.getClient();
        if (!client) {
            console.warn('Redis client is null, skipping cache invalidation');
            return;
        }
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
            console.log(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
        }
    }
    catch (error) {
        console.error('Error invalidating cache:', error);
    }
};
exports.invalidateCache = invalidateCache;
// Funções específicas de invalidação
const invalidateUserCache = async (userId) => {
    await (0, exports.invalidateCache)(`*:*:*userId:${userId}*`);
};
exports.invalidateUserCache = invalidateUserCache;
const invalidateProviderCache = async (providerId) => {
    await (0, exports.invalidateCache)(`*:*:*providerId:${providerId}*`);
};
exports.invalidateProviderCache = invalidateProviderCache;
const invalidateResourceCache = async (resource, resourceId) => {
    const pattern = resourceId
        ? `${resource}:*:*${resourceId}*`
        : `${resource}:*`;
    await (0, exports.invalidateCache)(pattern);
};
exports.invalidateResourceCache = invalidateResourceCache;
