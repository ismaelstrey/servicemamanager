import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Habilitação do Redis controlada por env
const isRedisEnabled = (): boolean => {
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
          reconnectStrategy: (_retries: number): number | false | Error => false,
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
          reconnectStrategy: (_retries: number): number | false | Error => false,
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
          reconnectStrategy: (_retries: number): number | false | Error => false,
        },
        retryDelayOnFailover: 50,
        enableReadyCheck: false,
        maxRetriesPerRequest: 1,
      };
  }
};

// Cliente Redis singleton
class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private connectionAttempted: boolean = false;

  private constructor() {
    // Cliente será criado apenas quando necessário
  }

  private createClient() {
    if (!isRedisEnabled()) {
      console.log('Redis desativado (defina REDIS_ENABLED=true para habilitar)');
      return;
    }
    if (!this.client) {
      const config = getRedisConfig();
      this.client = createClient(config);
      
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

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
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
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        console.warn('Redis connection failed, continuing without cache');
        // Não lança erro para permitir que a aplicação continue sem Redis
        this.isConnected = false;
        this.client = null; // Limpa o cliente para evitar tentativas futuras
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.disconnect();
    }
  }

  public getClient(): RedisClientType | null {
    return this.client;
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }

  // Métodos de conveniência para operações comuns
  public async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, skipping get operation');
      return null;
    }
    return await this.client.get(key);
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, skipping set operation');
      return;
    }
    
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, skipping delete operation');
      return;
    }
    await this.client.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }
    const result = await this.client.exists(key);
    return result === 1;
  }

  public async flushAll(): Promise<void> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, skipping flush operation');
      return;
    }
    await this.client.flushAll();
  }
}

// Exporta a instância singleton
export const redisClient = RedisClient.getInstance();
export default redisClient;