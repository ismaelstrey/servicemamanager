# 📋 Instruções Completas de Desenvolvimento - Sistema de Gerenciamento de Provedores

## 🎯 **VISÃO GERAL DO PROJETO**

Sistema web moderno para empresas que prestam serviços a provedores de internet, centralizando todas as operações por meio de workspaces dedicados com integração completa ao Zabbix para monitoramento automatizado.

---

## 🏗️ **ARQUITETURA E TECNOLOGIAS**

### 🔧 Stack Tecnológico
- **Backend**: Node.js + TypeScript + Express.js
- **Frontend**: React + TypeScript + Vite
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Estilização**: styled-components
- **Animações**: Framer Motion
- **Roteamento**: React Router DOM
- **Gerenciador**: pnpm
- **Processo**: PM2
- **Monitoramento**: Integração Zabbix
- **Documentação**: Swagger

### 📁 Estrutura de Pastas
```
telecomai/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── routes/         # Definição de rotas
│   │   ├── services/       # Lógica de negócio
│   │   ├── repositories/   # Acesso a dados
│   │   ├── middlewares/    # Middlewares personalizados
│   │   ├── utils/          # Utilitários e helpers
│   │   ├── validators/     # Validadores Zod
│   │   ├── docs/          # Documentação Swagger
│   │   └── server.ts      # Servidor principal
│   ├── prisma/
│   │   └── schema.prisma  # Schema do banco
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── hooks/        # Custom hooks
│   │   ├── styles/       # Estilos globais
│   │   └── assets/       # Recursos estáticos
│   └── package.json
└── docs/                 # Documentação do projeto
```

---

## 📊 **ROADMAP DE DESENVOLVIMENTO**

### ✅ **FASE 1: FUNDAÇÃO (CONCLUÍDA - 15%)**
- [x] Configuração do projeto TypeScript
- [x] Estrutura de pastas backend/frontend
- [x] Configuração Prisma + PostgreSQL
- [x] Sistema de autenticação (JWT + bcrypt)
- [x] Models básicos: User, Provider, Equipment, Ticket, PasswordVault
- [x] AuthController, AuthService, AuthRoutes
- [x] Middlewares de segurança
- [x] Validadores Zod para autenticação

### 🚧 **FASE 2: GESTÃO DE PROVEDORES (0%)**
- [ ] ProviderController completo
- [ ] Endpoints CRUD para provedores
- [ ] Sistema de workspaces únicos
- [ ] Validação de CNPJ
- [ ] Dashboard por provedor
- [ ] Permissões por provedor

### 🚧 **FASE 3: GESTÃO DE EQUIPAMENTOS (0%)**
- [ ] EquipmentController
- [ ] Cadastro de equipamentos por tipo:
  - [ ] Switches
  - [ ] OLTs (Optical Line Terminal)
  - [ ] Roteadores
  - [ ] Servidores
  - [ ] Virtualizadores
- [ ] Controle de serial único
- [ ] Status de equipamentos
- [ ] Estatísticas por provedor

### 🚧 **FASE 4: SISTEMA DE TICKETS (0%)**
- [ ] TicketController completo
- [ ] Sistema de status (open, in_progress, waiting_client, resolved, closed)
- [ ] Sistema de prioridades (low, medium, high, critical)
- [ ] Vinculação automática ao provedor
- [ ] Comentários e atualizações
- [ ] Filtros avançados

### 🚧 **FASE 5: COFRE DE SENHAS (0%)**
- [ ] PasswordVaultController
- [ ] Criptografia AES-256
- [ ] Controle de acesso por usuário
- [ ] Log de acessos
- [ ] Expiração de senhas

### 🚧 **FASE 6: ORDENS DE SERVIÇO (0%)**
- [ ] ServiceOrderController
- [ ] Model ServiceOrder no Prisma
- [ ] Visualizações:
  - [ ] Lista com paginação
  - [ ] Grade com agrupamento
  - [ ] Kanban por status
- [ ] Workflow de aprovação

### 🚧 **FASE 7: INTEGRAÇÃO ZABBIX (0%)**
- [ ] ZabbixServerController
- [ ] ZabbixWebhookController
- [ ] Models: ZabbixServer, ZabbixConfig, ZabbixEvent
- [ ] Webhook para criação automática de tickets
- [ ] Mapeamento de severidade
- [ ] Filtros configuráveis

### 🚧 **FASE 8: DASHBOARD E RELATÓRIOS (0%)**
- [ ] DashboardController
- [ ] Métricas por provedor:
  - [ ] Quantidade de equipamentos
  - [ ] Tickets abertos/resolvidos
  - [ ] Tempo médio de resolução
  - [ ] Status do cofre de senhas
- [ ] Gráficos e visualizações
- [ ] Exportação de relatórios

### 🚧 **FASE 9: FRONTEND COMPLETO (0%)**
- [ ] Páginas de autenticação
- [ ] Dashboard principal
- [ ] Gestão de provedores
- [ ] Inventário de equipamentos
- [ ] Sistema de tickets
- [ ] Cofre de senhas
- [ ] Ordens de serviço
- [ ] Configurações Zabbix

### 🚧 **FASE 10: FUNCIONALIDADES IA (OPCIONAL - 0%)**
- [ ] Sugestão de prioridade de tickets
- [ ] Previsão de falhas em equipamentos
- [ ] Chat inteligente para suporte

---

## 🔗 **INTEGRAÇÃO ZABBIX DETALHADA**

### 🎯 Funcionalidades da Integração
- **Cadastro de Servidores Zabbix** por provedor/cliente
- **Webhook Endpoint** para receber eventos
- **Criação Automática de Tickets** baseada em eventos
- **Mapeamento de Severidade** configurável
- **Filtros de Eventos** por grupos e severidade
- **Log de Auditoria** completo

### 📊 Models Adicionais no Prisma

```prisma
model ZabbixServer {
  id          Int      @id @default(autoincrement())
  name        String   // Nome do servidor
  url         String   // URL da API Zabbix
  version     String?  // Versão do Zabbix
  apiToken    String?  // Token de API
  username    String?  // Usuário
  password    String?  // Senha criptografada
  isActive    Boolean  @default(true)
  
  provider    Provider @relation(fields: [providerId], references: [id])
  providerId  Int
  
  configs     ZabbixConfig[]
  events      ZabbixEvent[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([providerId, name])
}

model ZabbixConfig {
  id                    Int      @id @default(autoincrement())
  enabledTriggers       Boolean  @default(true)
  enabledHosts          Boolean  @default(true)
  severityMapping       Json     // Mapeamento de severidade
  minSeverity          Int      @default(0)
  allowedHostGroups    String[] // Grupos permitidos
  blockedHostGroups    String[] // Grupos bloqueados
  autoCreateTickets    Boolean  @default(true)
  defaultPriority      String   @default("medium")
  ticketPrefix         String   @default("[ZABBIX]")
  
  zabbixServer         ZabbixServer @relation(fields: [zabbixServerId], references: [id])
  zabbixServerId       Int          @unique
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model ZabbixEvent {
  id              Int      @id @default(autoincrement())
  eventId         String   // ID do evento no Zabbix
  eventType       String   // trigger, host, item
  severity        Int      // Severidade (0-5)
  status          String   // OK, PROBLEM
  triggerName     String?
  hostName        String?
  hostGroup       String?
  webhookPayload  Json     // Payload completo
  processed       Boolean  @default(false)
  ticketCreated   Boolean  @default(false)
  errorMessage    String?
  
  zabbixServer    ZabbixServer @relation(fields: [zabbixServerId], references: [id])
  zabbixServerId  Int
  ticket          Ticket?  @relation(fields: [ticketId], references: [id])
  ticketId        Int?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([zabbixServerId, eventId])
}
```

### 🛠️ Endpoints da Integração Zabbix

```typescript
// Gerenciamento de Servidores Zabbix
POST   /providers/:providerId/zabbix-servers     // Cadastrar servidor
GET    /providers/:providerId/zabbix-servers     // Listar servidores
GET    /zabbix-servers/:id                       // Detalhes do servidor
PUT    /zabbix-servers/:id                       // Atualizar servidor
DELETE /zabbix-servers/:id                       // Remover servidor
POST   /zabbix-servers/:id/test-connection       // Testar conexão

// Configurações
GET    /zabbix-servers/:id/config                // Obter configurações
PUT    /zabbix-servers/:id/config                // Atualizar configurações

// Webhooks (público)
POST   /webhooks/zabbix/:serverId                // Receber eventos

// Eventos (protegido)
GET    /webhooks/zabbix/:serverId/events         // Listar eventos
POST   /webhooks/zabbix/:serverId/events/:eventId/reprocess  // Reprocessar
GET    /webhooks/zabbix/:serverId/stats          // Estatísticas
```

### ⚙️ Configuração no Zabbix

#### Media Type (Webhook)
```javascript
// Nome: Sistema Gerenciamento Provedores
// Tipo: Webhook
// URL: https://seu-dominio.com/api/webhooks/zabbix/{SERVIDOR_ID}

// Script do Webhook:
var req = new HttpRequest();
req.addHeader('Content-Type: application/json');

var payload = {
    eventid: params.eventid,
    eventtype: params.eventtype,
    severity: parseInt(params.severity),
    status: params.status,
    trigger: {
        name: params.trigger_name,
        severity: parseInt(params.trigger_severity)
    },
    host: {
        name: params.host_name,
        groups: params.host_groups.split(',')
    },
    timestamp: params.event_date + ' ' + params.event_time
};

return req.post('{$WEBHOOK_URL}', JSON.stringify(payload));
```

#### Action Configuration
```
Nome: Criar Ticket - Sistema Gerenciamento
Condições:
- Trigger severity >= Warning
- Host group matches: (grupos do cliente)

Operações:
- Send message via: Sistema Gerenciamento Provedores
- Send to users: (usuário webhook)
```

---

## 🔒 **PADRÕES DE SEGURANÇA**

### 🛡️ Autenticação e Autorização
- **JWT Tokens** com expiração configurável
- **bcrypt** para hash de senhas (salt rounds: 12)
- **Middleware de autenticação** em todas as rotas protegidas
- **Rate limiting** por IP e usuário
- **Validação rigorosa** com Zod em todos os inputs

### 🔐 Proteção de Dados Sensíveis
- **Criptografia AES-256** para senhas do cofre
- **Variáveis de ambiente** para configurações sensíveis
- **Sanitização** de dados de entrada
- **Logs de auditoria** para ações críticas
- **Tokens únicos** para webhooks Zabbix

### 🚫 Validações de Segurança
```typescript
// Exemplo de validação robusta
export const createProviderSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
  workspace: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  // Sanitização automática de XSS
}).transform(data => ({
  ...data,
  name: sanitizeHtml(data.name),
  workspace: data.workspace.toLowerCase()
}));
```

---

## 📋 **PADRÕES DE CÓDIGO**

### 🎨 Convenções de Nomenclatura
- **Arquivos**: camelCase (`userController.ts`)
- **Funções**: camelCase (`createUser()`)
- **Variáveis**: camelCase (`userName`)
- **Classes**: PascalCase (`UserController`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Interfaces**: PascalCase com prefixo I (`IUserRepository`)

### 📝 Comentários e Documentação
```typescript
/**
 * Cria um novo usuário no sistema
 * @param userData - Dados do usuário a ser criado
 * @returns Promise com o usuário criado (sem senha)
 * @throws {ValidationError} Quando os dados são inválidos
 * @throws {ConflictError} Quando o email já existe
 */
async createUser(userData: CreateUserDto): Promise<UserResponse> {
  // Validar dados de entrada
  const validatedData = createUserSchema.parse(userData);
  
  // Verificar se email já existe
  const existingUser = await this.userRepository.findByEmail(validatedData.email);
  if (existingUser) {
    throw new ConflictError('Email já cadastrado');
  }
  
  // Criar usuário
  return await this.userRepository.create(validatedData);
}
```

### 🏗️ Arquitetura em Camadas
```
Controller → Service → Repository → Database
     ↓         ↓          ↓
  Validação  Lógica   Acesso
  de Input  Negócio   Dados
```

### 🔄 Padrão de Hooks (Frontend)
```typescript
// Hook personalizado para API
export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/providers');
      setProviders(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar provedores');
    } finally {
      setLoading(false);
    }
  }, []);

  return { providers, loading, error, fetchProviders };
};
```

---

## 🚀 **COMANDOS DE DESENVOLVIMENTO**

### 📦 Instalação e Setup
```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
cp backend/.env.example backend/.env
# Editar DATABASE_URL no .env

# Executar migrations
pnpm --filter ./backend prisma migrate dev

# Gerar cliente Prisma
pnpm --filter ./backend prisma generate

# Seed inicial (opcional)
pnpm --filter ./backend prisma db seed
```

### 🔧 Desenvolvimento
```bash
# Iniciar backend em desenvolvimento
pnpm --filter ./backend dev

# Iniciar frontend em desenvolvimento  
pnpm --filter ./frontend dev

# Iniciar ambos simultaneamente
pnpm dev

# Build para produção
pnpm build

# Executar testes
pnpm test
```

### 🗄️ Banco de Dados
```bash
# Criar nova migration
pnpm --filter ./backend prisma migrate dev --name nome_da_migration

# Reset do banco (cuidado!)
pnpm --filter ./backend prisma migrate reset

# Visualizar banco no Prisma Studio
pnpm --filter ./backend prisma studio

# Deploy de migrations em produção
pnpm --filter ./backend prisma migrate deploy
```

### 🚀 Produção com PM2
```bash
# Iniciar aplicação
pm2 start pm2.config.yml

# Monitorar processos
pm2 monit

# Ver logs
pm2 logs

# Restart aplicação
pm2 restart all

# Parar aplicação
pm2 stop all
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### 🔬 Estratégia de Testes
- **Testes Unitários**: Services e utilitários
- **Testes de Integração**: Controllers e rotas
- **Testes E2E**: Fluxos completos
- **Testes de API**: Endpoints com diferentes cenários

### 📋 Checklist de Qualidade
- [ ] Validação Zod em todos os inputs
- [ ] Tratamento de erros adequado
- [ ] Logs estruturados
- [ ] Documentação de API atualizada
- [ ] Testes cobrindo casos principais
- [ ] Segurança validada
- [ ] Performance otimizada

### 🎯 Exemplo de Teste
```typescript
describe('AuthController', () => {
  it('deve criar usuário com dados válidos', async () => {
    const userData = {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: 'senha123'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(userData.email);
    expect(response.body).not.toHaveProperty('password');
  });
});
```

---

## 📊 **MONITORAMENTO E LOGS**

### 📈 Métricas Importantes
- **Performance**: Tempo de resposta das APIs
- **Disponibilidade**: Uptime do sistema
- **Uso**: Número de usuários ativos
- **Erros**: Taxa de erro por endpoint
- **Zabbix**: Eventos processados e tickets criados

### 📝 Estrutura de Logs
```typescript
// Log estruturado
logger.info('Usuário criado com sucesso', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
  ip: req.ip,
  userAgent: req.get('User-Agent')
});

// Log de erro
logger.error('Falha ao criar usuário', {
  error: error.message,
  stack: error.stack,
  input: sanitizedInput,
  timestamp: new Date().toISOString()
});
```

---

## 🔄 **FLUXOS DE TRABALHO**

### 📋 Fluxo de Desenvolvimento
1. **Análise** → Entender requisito
2. **Design** → Planejar implementação
3. **Implementação** → Codificar solução
4. **Testes** → Validar funcionamento
5. **Documentação** → Atualizar docs
6. **Review** → Revisão de código
7. **Deploy** → Publicar alterações

### 🎫 Fluxo de Ticket Zabbix
1. **Evento** → Zabbix detecta problema
2. **Webhook** → Envia dados para API
3. **Validação** → Verifica configurações
4. **Filtros** → Aplica regras definidas
5. **Criação** → Gera ticket automaticamente
6. **Notificação** → Informa equipe
7. **Resolução** → Acompanha até fechamento

---

## 📚 **RECURSOS E REFERÊNCIAS**

### 📖 Documentação Técnica
- [Prisma ORM](https://www.prisma.io/docs/)
- [Zod Validation](https://zod.dev/)
- [Express.js](https://expressjs.com/)
- [React + TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [styled-components](https://styled-components.com/docs)
- [Zabbix API](https://www.zabbix.com/documentation/current/en/manual/api)

### 🛠️ Ferramentas Recomendadas
- **IDE**: VS Code com extensões TypeScript, Prisma, ESLint
- **API Testing**: Postman ou Insomnia
- **Database**: pgAdmin ou DBeaver
- **Monitoring**: PM2 Dashboard
- **Git**: Conventional Commits

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

### 🚀 Implementação Imediata
1. **Completar ProviderController** - Base para todo sistema
2. **Implementar EquipmentController** - Inventário essencial
3. **Desenvolver TicketController** - Core do negócio
4. **Integrar Zabbix** - Automação crítica
5. **Criar Frontend básico** - Interface inicial

### 📈 Melhorias Futuras
- Cache Redis para performance
- Notificações em tempo real (WebSocket)
- Backup automatizado
- Métricas avançadas
- Mobile app (React Native)

---

*Instruções Completas de Desenvolvimento - Sistema de Gerenciamento de Provedores*  
*Versão: 1.0 | Atualizado: Janeiro 2025*  
*Status: Fundação completa (15%) - Pronto para desenvolvimento das próximas fases*