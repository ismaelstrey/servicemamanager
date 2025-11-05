import Redis, { RedisOptions } from 'ioredis';

export function createRedisConnection(): Redis {
  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const tls = process.env.REDIS_TLS === 'true';
  const opt: RedisOptions = { lazyConnect: true, maxRetriesPerRequest: null };

  // Autenticação quando necessário
  if (process.env.REDIS_PASSWORD) {
    (opt as any).password = process.env.REDIS_PASSWORD;
  }
  if (process.env.REDIS_USERNAME) {
    (opt as any).username = process.env.REDIS_USERNAME;
  }

  // ioredis aceita URL diretamente
  if (tls) {
    // Ativa TLS quando configurado
    (opt as any).tls = {};
  }
  const conn = new Redis(url, opt);
  return conn;
}

export function isBullEnabled(): boolean {
  return (process.env.OUTBOUND_BULLMQ_ENABLED || 'false').toLowerCase() === 'true';
}