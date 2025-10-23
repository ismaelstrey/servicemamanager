# Documentação do Sistema de Cache Redis

## Visão Geral

O sistema de cache Redis foi implementado para melhorar a performance da aplicação através do armazenamento temporário de dados frequentemente acessados. O sistema é **opcional** e a aplicação funciona normalmente mesmo sem o Redis instalado.

## Configuração

### Variáveis de Ambiente

```bash
# Opcional - URL de conexão do Redis
REDIS_URL=redis://localhost:6379

# Opcional - Ambiente da aplicação (afeta configurações do Redis)
NODE_ENV=development|staging|production
```

### Configurações por Ambiente

#### Development
- **Timeout de conexão**: 10 segundos
- **Retry delay**: 50ms
- **Max retries**: 1
- **Ready check**: Desabilitado

#### Staging
- **Timeout de conexão**: 30 segundos
- **Retry delay**: 100ms
- **Max retries**: 2
- **Ready check**: Habilitado

#### Production
- **Timeout de conexão**: 60 segundos
- **Retry delay**: 100ms
- **Max retries**: 3
- **Ready check**: Habilitado

## Instalação do Redis (Opcional)

### Windows
```bash
# Via Chocolatey
choco install redis-64

# Via WSL2
wsl --install
# Dentro do WSL:
sudo apt update
sudo apt install redis-server
redis-server
```

### Linux/macOS
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# macOS via Homebrew
brew install redis
brew services start redis
```

### Docker
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

## Uso do Sistema de Cache

### Middleware de Cache

O middleware de cache é aplicado automaticamente em rotas específicas:

```typescript
// Exemplo de uso em rotas
app.get('/api/comments/recent', cacheMiddleware, commentController.getRecentComments);
```

### Configurações do Cache

```typescript
interface CacheOptions {
  ttl?: number;        // Time to live em segundos (padrão: 300 = 5 minutos)
  keyPrefix?: string;  // Prefixo para a chave do cache
  skipCache?: boolean; // Pular cache para esta requisição
  varyBy?: string[];   // Campos para variar a chave do cache
}
```

### Operações Básicas

```typescript
import { redisClient } from '../config/redis';

// Armazenar dados
await redisClient.set('chave', 'valor', 300); // TTL de 5 minutos

// Recuperar dados
const valor = await redisClient.get('chave');

// Verificar existência
const existe = await redisClient.exists('chave');

// Deletar dados
await redisClient.del('chave');

// Limpar todo o cache
await redisClient.flushAll();
```

## Comportamento sem Redis

Quando o Redis não está disponível:

1. **Inicialização**: A aplicação continua normalmente
2. **Logs**: Avisos são exibidos indicando que o cache está desabilitado
3. **Performance**: Operações são executadas diretamente no banco de dados
4. **Funcionalidade**: Todas as funcionalidades permanecem operacionais

### Logs Típicos sem Redis

```
Redis Client Error: AggregateError: connect ECONNREFUSED 127.0.0.1:6379
Failed to connect to Redis: [Error details]
Redis connection failed, continuing without cache
Aplicação continuará sem cache Redis
```

## Rotas com Cache Implementado

### Comentários
- `GET /api/comments/recent` - Cache de 5 minutos
- `GET /api/comments` - Cache de 5 minutos
- `GET /api/comments/:id` - Cache de 10 minutos

### Providers
- `GET /api/providers` - Cache de 10 minutos
- `GET /api/providers/:id` - Cache de 15 minutos

### Dashboard
- `GET /api/dashboard/:providerId` - Cache de 5 minutos

## Estratégias de Cache

### Cache-Aside (Lazy Loading)
- Dados são carregados no cache apenas quando solicitados
- Implementado na maioria das rotas de leitura

### Write-Through
- Dados são atualizados no cache simultaneamente com o banco
- Implementado em operações críticas

### TTL (Time To Live)
- Todos os dados têm expiração automática
- Previne dados obsoletos no cache

## Monitoramento

### Verificação de Status
```typescript
// Verificar se o Redis está conectado
const isConnected = redisClient.isClientConnected();

// Obter cliente Redis (pode ser null)
const client = redisClient.getClient();
```

### Métricas Importantes
- **Hit Rate**: Taxa de acertos do cache
- **Miss Rate**: Taxa de falhas do cache
- **Memory Usage**: Uso de memória do Redis
- **Connection Status**: Status da conexão

## Troubleshooting

### Problemas Comuns

#### Redis não conecta
```bash
# Verificar se o Redis está rodando
redis-cli ping
# Resposta esperada: PONG

# Verificar porta
netstat -an | grep 6379
```

#### Cache não funciona
1. Verificar logs da aplicação
2. Confirmar variáveis de ambiente
3. Testar conexão manual com Redis

#### Performance degradada
1. Verificar TTL das chaves
2. Monitorar uso de memória
3. Analisar padrões de acesso

### Comandos Úteis do Redis

```bash
# Conectar ao Redis CLI
redis-cli

# Listar todas as chaves
KEYS *

# Ver informações do servidor
INFO

# Monitorar comandos em tempo real
MONITOR

# Limpar todo o cache
FLUSHALL
```

## Segurança

### Recomendações
- Use autenticação em produção: `AUTH password`
- Configure bind para IPs específicos
- Use SSL/TLS para conexões remotas
- Implemente rate limiting

### Configuração Segura
```bash
# redis.conf
bind 127.0.0.1
requirepass your-strong-password
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## Performance

### Otimizações
- Use TTL apropriado para cada tipo de dado
- Implemente cache warming para dados críticos
- Monitore hit/miss ratios
- Configure memory policies adequadas

### Benchmarks Típicos
- **Latência**: < 1ms para operações simples
- **Throughput**: > 100k ops/sec
- **Memory**: ~1MB por 100k chaves simples

## Conclusão

O sistema de cache Redis melhora significativamente a performance da aplicação, mas foi projetado para ser completamente opcional. Isso garante que a aplicação seja robusta e funcione em qualquer ambiente, independentemente da disponibilidade do Redis.