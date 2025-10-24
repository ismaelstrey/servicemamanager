import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { redisClient } from '../config/redis';

// Interface para configuração do cache
interface CacheOptions {
  ttl?: number; // Time to live em segundos (padrão: 300 = 5 minutos)
  keyPrefix?: string; // Prefixo para a chave do cache
  skipCache?: boolean; // Pular cache para esta requisição
  varyBy?: string[]; // Campos para variar a chave do cache
}

// Gera chave do cache baseada na requisição
const generateCacheKey = (req: AuthenticatedRequest, options: CacheOptions): string => {
  const baseKey = `${options.keyPrefix || 'api'}:${req.method}:${req.originalUrl}`;
  
  // Adiciona variações baseadas em parâmetros específicos
  if (options.varyBy && options.varyBy.length > 0) {
    const variations = options.varyBy.map(field => {
      if (field === 'userId') return req.user?.id || 'anonymous';
      if (field === 'providerId') return req.providerId || 'no-provider';
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
  const queryString = new URLSearchParams(req.query as any).toString();
  if (queryString) {
    return `${baseKey}:${queryString}`;
  }
  
  return baseKey;
};

// Middleware principal de cache
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const defaultTTL = options.ttl || 300; // 5 minutos por padrão
  
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Pula cache para métodos que não são GET
    if (req.method !== 'GET' || options.skipCache) {
      return next();
    }
    
    try {
      const cacheKey = generateCacheKey(req, options);
      
      // Tenta buscar no cache
      const cachedData = await redisClient.get(cacheKey);
      
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
      
      res.json = function(data: any) {
        // Salva no cache apenas se a resposta foi bem-sucedida
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.set(cacheKey, JSON.stringify(data), defaultTTL).catch(err => {
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
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Em caso de erro no cache, continua sem cache
      next();
    }
  };
};

// Middleware específico para listagens com paginação
export const listCacheMiddleware = (options: Omit<CacheOptions, 'varyBy'> = {}) => {
  return cacheMiddleware({
    ...options,
    ttl: options.ttl || 180, // 3 minutos para listagens
    varyBy: ['userId', 'providerId', 'query.page', 'query.limit', 'query.status', 'query.priority', 'query.startDate', 'query.endDate']
  });
};

// Middleware específico para dados de dashboard
export const dashboardCacheMiddleware = (options: Omit<CacheOptions, 'varyBy'> = {}) => {
  return cacheMiddleware({
    ...options,
    ttl: options.ttl || 120, // 2 minutos para dashboard
    keyPrefix: 'dashboard',
    varyBy: ['userId', 'providerId']
  });
};

// Middleware específico para estatísticas
export const statsCacheMiddleware = (options: Omit<CacheOptions, 'varyBy'> = {}) => {
  return cacheMiddleware({
    ...options,
    ttl: options.ttl || 600, // 10 minutos para estatísticas
    keyPrefix: 'stats',
    varyBy: ['userId', 'providerId']
  });
};

// Middleware específico para dados de equipamentos
export const equipmentCacheMiddleware = (options: Omit<CacheOptions, 'varyBy'> = {}) => {
  return cacheMiddleware({
    ...options,
    ttl: options.ttl || 300, // 5 minutos para equipamentos
    keyPrefix: 'equipment',
    varyBy: ['userId', 'providerId', 'params.id']
  });
};

// Middleware específico para tickets
export const ticketCacheMiddleware = (options: Omit<CacheOptions, 'varyBy'> = {}) => {
  return cacheMiddleware({
    ...options,
    ttl: options.ttl || 120, // 2 minutos para tickets (dados mais dinâmicos)
    keyPrefix: 'ticket',
    varyBy: ['userId', 'providerId', 'params.id', 'query.status']
  });
};

// Middleware específico para ordens de serviço
export const serviceOrderCacheMiddleware = (options: Omit<CacheOptions, 'varyBy'> = {}) => {
  return cacheMiddleware({
    ...options,
    ttl: options.ttl || 180, // 3 minutos para ordens de serviço
    keyPrefix: 'service-order',
    varyBy: ['userId', 'providerId', 'params.id', 'query.status']
  });
};

// Função para invalidar cache por padrão
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    if (!redisClient.isClientConnected()) {
      console.warn('Redis not connected, skipping cache invalidation');
      return;
    }
    
    const client = redisClient.getClient();
    if (!client) {
      console.warn('Redis client is null, skipping cache invalidation');
      return;
    }
    
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};

// Funções específicas de invalidação
export const invalidateUserCache = async (userId: string): Promise<void> => {
  await invalidateCache(`*:*:*userId:${userId}*`);
};

export const invalidateProviderCache = async (providerId: string): Promise<void> => {
  await invalidateCache(`*:*:*providerId:${providerId}*`);
};

export const invalidateResourceCache = async (resource: string, resourceId?: string): Promise<void> => {
  const pattern = resourceId 
    ? `${resource}:*:*${resourceId}*`
    : `${resource}:*`;
  await invalidateCache(pattern);
};