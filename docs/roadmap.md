# TelecomAI Monorepo

Este documento descreve o roadmap detalhado, arquitetura em camadas, convenções e documentação de uso, seguindo as regras do projeto.

## Roadmap Detalhado

### Fase 1 — Fundamentos e Infra
- [ ] Estrutura monorepo (pnpm workspaces)
- [ ] Configuração de lint (ESLint TS)
- [ ] Backend Express + TS (camadas: controllers, routes, services, repositories, middlewares, utils, validators, docs, server.ts)
- [ ] Prisma + PostgreSQL (schema, migrações)
- [ ] Autenticação JWT + bcrypt
- [ ] Swagger (swagger-ui-express)
- [ ] Frontend React + Vite + TS
- [ ] styled-components, react-router-dom, framer-motion
- [ ] Hooks para API (useApi), autenticação (useAuth)

### Fase 2 — Domínio
- [ ] Provedores (CRUD)
- [ ] Equipamentos (Switch, OLT, roteador, servidor, virtualizador)
- [ ] Tickets (abertos, resolvidos)
- [ ] Cofre de senhas (acesso controlado)
- [ ] Links ativos
- [ ] Dashboard por workspace
- [ ] Visualizações OS: lista, grade, Kanban

### Fase 3 — IA Opcional
- [ ] Sugestão de prioridade de tickets (histórico)
- [ ] Previsão de falhas em equipamentos
- [ ] Chat inteligente de suporte interno

## Arquitetura em Camadas (Backend)
- src/controllers
- src/routes
- src/services
- src/repositories
- src/middlewares
- src/utils
- src/validators
- src/docs
- src/server.ts

## Convenções
- Linguagem: TypeScript
- Framework: React (frontend) / Express (backend)
- ORM: Prisma
- Gerenciador: pnpm
- Processos: PM2
- Ambiente: dotenv
- Auth: JWT + bcrypt
- Docs: Swagger
- Padronização: ESLint
- Estilização: styled-components
- Organização: Arquitetura em camadas
- Pastas: conforme acima
- Documentação: README.md
- Envio: GitHub
- Versões: mais recentes
- Animação: framer-motion
- Proteção de rotas: react-router-dom
- Tipagem: TypeScript, sem any
- Hooks de API: criar useApi para acesso limpo à API
- camelCase para arquivos, funções e variáveis
- Comentários em português BR explicando funções

## Execução
1. Configure .env a partir de .env.example
2. Instale dependências: pnpm install
3. Backend: pnpm --filter backend dev
4. Frontend: pnpm --filter frontend dev
5. Documentação Swagger disponível em /docs

## API do Portal do Cliente (para o Frontend)
- Base: `/api/client`
- Autenticação: Bearer JWT (`Authorization: Bearer <token>`) via `clientAuthMiddleware`
- Formato: `Content-Type: application/json`

### Autenticação do Cliente
- `POST /api/client/auth/register` — registrar cliente
- `POST /api/client/auth/login` — autenticar e receber token
- `POST /api/client/auth/forgot-password` — iniciar recuperação
- `POST /api/client/auth/reset-password` — concluir recuperação
- `GET /api/client/auth/profile` — dados do cliente autenticado

### Perfil do Cliente
- `PUT /api/client/profile` — atualizar preferências do cliente

### Ordens de Serviço (Cliente)
- `POST /api/client/service-orders` — abrir OS; body: `title`, `description`, `scheduledDate?`
- `GET /api/client/service-orders` — listar; query: `page`, `limit`, `status?`
- `GET /api/client/service-orders/:id` — detalhes
- `PUT /api/client/service-orders/:id` — atualizar campos do cliente
- `POST /api/client/service-orders/:id/comments` — comentar; body: `content`
- `POST /api/client/service-orders/:id/qualification` — qualificar; body: `rating (1-5)`, `feedback?`
- `POST /api/client/service-orders/:id/attachments` — upload de anexos (pendente)

### Tickets (Cliente)
- `POST /api/client/tickets` — abrir ticket; body: `title`, `description`, `priority`
- `GET /api/client/tickets` — listar; query: `page`, `limit`, `status?`, `priority?`, `search?`
- `GET /api/client/tickets/:id` — detalhes com comentários
- `POST /api/client/tickets/:id/comments` — comentar; body: `content`
- `POST /api/client/tickets/:id/attachments` — upload de anexos (pendente)

## Páginas do Frontend (Portal do Cliente)
- Login e recuperação de senha → `auth/*`
- Dashboard do cliente → cards de OS/tickets, prazos e SLAs
- Minhas Ordens de Serviço → lista, detalhe, abrir, comentários, qualificar, anexos (pendente)
- Meus Tickets → lista, detalhe, abrir, comentários, anexos (pendente)
- Perfil e Preferências → `GET /api/client/auth/profile`, `PUT /api/client/profile`
- Notificações (futuro) → listar e marcar como lida (pendente)

## Convenções de Consumo da API
- Header `Authorization: Bearer <token>` obrigatório nas rotas de cliente (exceto register/login/forgot/reset)
- Paginação: usar `page` e `limit` nas listas; responses retornam metadados de paginação
- Escopo: dados sempre filtrados por `providerId` do cliente
- Validação: Zod aplicada nos endpoints; seguir formatos descritos acima

## Roadmap Detalhado do Frontend (Styled-Components & Design System)

### Fase 1 — Design System e Fundamentos
- [ ] **Design System Base**
  - [x] `src/styles/theme/` — sistema de temas com tokens de design
  - [x] `src/styles/tokens/` — tokens de cores, tipografia, espaçamentos, shadows
  - [x] `src/styles/breakpoints/` — sistema de breakpoints responsivos
  - [x] `src/styles/animations/` — animações e transições padronizadas
  - [x] `src/styles/mixins/` — mixins reutilizáveis para styled-components
  - [x] `src/styles/globalStyles.ts` — estilos globais com styled-components

- [ ] **Estrutura de Pastas Profissional**
  - [x] `src/components/ui/` — componentes de interface básicos (atoms)
  - [x] `src/components/composite/` — componentes compostos (molecules)
  - [x] `src/components/layout/` — componentes de layout (organisms)
  - [x] `src/components/forms/` — componentes de formulário especializados
  - [x] `src/components/templates/` — templates de página (templates)
  - [x] `src/pages/` — páginas da aplicação (pages)
  - [x] `src/hooks/` — custom hooks reutilizáveis
  - [x] `src/services/` — comunicação com API
  - [x] `src/types/` — interfaces TypeScript
  - [x] `src/utils/` — funções utilitárias
  - [x] `src/contexts/` — contextos React (Auth, Theme)

- [ ] **Configuração Base**
  - [x] ThemeProvider configurado com styled-components
  - [ ] Sistema de temas (light/dark) com Context API
  - [x] Configurar axios interceptors para autenticação
  - [ ] Implementar hook `useApi` para requisições
  - [x] Configurar roteamento protegido
  - [x] Sistema de breakpoints responsivos

### Fase 2 — Design Tokens e Tipagem
- [ ] **Design Tokens**
  - [x] Paleta de cores primárias, secundárias e neutras
  - [x] Sistema tipográfico (font-family, sizes, weights, line-heights)
  - [x] Espaçamentos padronizados (4px, 8px, 16px, 24px, 32px, etc.)
  - [x] Bordas e raios (border-radius, border-width)
  - [x] Sombras e elevações (box-shadow levels)
  - [x] Z-index scale padronizado
  - [x] Durações de animação padronizadas

- [ ] **Tipos TypeScript Avançados**
  - [x] `ThemeType` — tipagem completa do tema
  - [x] `ComponentVariants` — variantes de componentes
  - [x] `ResponsiveProps` — props responsivas
  - [x] `StyledProps` — props para styled-components
  - [x] `User`, `Ticket`, `ServiceOrder` — entidades de domínio
  - [x] `ApiResponse`, `PaginationMeta` — tipos de API
  - [x] `FormValidation` — tipos para validação de formulários

### Fase 3 — Componentes UI Base (Atoms)
- [ ] **Componentes Fundamentais**
  - [x] `Button` — com variantes (primary, secondary, outline, ghost, danger)
  - [x] `Input` — com estados (default, focus, error, disabled, success)
  - [x] `TextArea` — área de texto estilizada
  - [x] `Select` — dropdown customizado
  - [x] `Checkbox` — checkbox estilizado
  - [x] `Radio` — radio button customizado
  - [x] `Switch` — toggle switch
  - [x] `Label` — labels padronizados
  - [x] `Text` — componente de texto com variantes tipográficas
  - [x] `Heading` — títulos com hierarquia (h1-h6)
  - [x] `Icon` — sistema de ícones SVG
  - [x] `Avatar` — avatares de usuário
  - [x] `Badge` — badges de status e notificação
  - [x] `Divider` — separadores visuais
  - [x] `Spinner` — indicadores de carregamento

### Fase 4 — Componentes Compostos (Molecules)
- [ ] **Componentes Intermediários**
  - [x] `InputGroup` — input com label, helper text e validação
  - [x] `SearchBox` — caixa de busca com ícone
  - [x] `ButtonGroup` — grupo de botões
  - [x] `Card` — cartões com header, body, footer
  - [x] `Modal` — modais responsivos e acessíveis
  - [x] `Tooltip` — tooltips posicionáveis
  - [x] `Popover` — popovers customizáveis
  - [x] `Dropdown` — menus dropdown
  - [x] `Tabs` — sistema de abas
  - [x] `Accordion` — acordeões expansíveis
  - [x] `Breadcrumb` — navegação breadcrumb
  - [x] `Pagination` — paginação estilizada
  - [x] `ProgressBar` — barras de progresso
  - [x] `Alert` — alertas e notificações
  - [x] `Toast` — notificações temporárias

### Fase 5 — Componentes de Layout (Organisms)
- [x] **Estruturas Complexas**
  - [x] `Header` — cabeçalho com navegação e perfil
  - [x] `Sidebar` — menu lateral responsivo
  - [x] `Navigation` — componentes de navegação
  - [x] `Footer` — rodapé estruturado
  - [x] `DataTable` — tabelas com sorting, filtering, paginação
  - [x] `DataGrid` — grid de dados avançado
  - [x] `FormSection` — seções de formulário
  - [x] `StatsCard` — cartões de estatísticas
  - [x] `ChartContainer` — containers para gráficos
  - [x] `FilterPanel` — painel de filtros
  - [x] `SearchResults` — resultados de busca
  - [x] `CommentThread` — thread de comentários
  - [x] `FileUpload` — upload de arquivos
  - [x] `Calendar` — componente de calendário
  - [x] `Timeline` — linha do tempo de eventos

### Fase 6 — Templates e Layouts
- [x] **Templates de Página**
  - [x] `AuthTemplate` — template para páginas de autenticação
  - [x] `DashboardTemplate` — template do dashboard
  - [x] `ListTemplate` — template para listas (tickets, OS)
  - [x] `DetailTemplate` — template para detalhes
  - [x] `FormTemplate` — template para formulários
  - [x] `ErrorTemplate` — template para páginas de erro
  - [x] `EmptyStateTemplate` — template para estados vazios

- [x] **Sistema de Layout Responsivo**
  - [x] Grid system com styled-components
  - [x] Container responsivo
  - [x] Flexbox utilities
  - [x] Spacing utilities
  - [x] Visibility utilities (hide/show por breakpoint)

### Fase 7 — Páginas de Autenticação
- [ ] **Sistema de Auth Completo**
  - [x] `LoginPage` — página de login estilizada
  - [x] `RegisterPage` — página de registro
  - [ ] `ForgotPasswordPage` — recuperação de senha
  - [ ] `ResetPasswordPage` — redefinição de senha
  - [x] `AuthContext` — contexto de autenticação
  - [x] `useAuth` — hook de autenticação
  - [x] `ProtectedRoute` — proteção de rotas
  - [ ] Interceptor para refresh token automático

### Fase 8 — Dashboard e Métricas
- [ ] **Dashboard Profissional**
  - [ ] Cards de métricas com animações
  - [ ] Gráficos integrados (Chart.js/Recharts)
  - [ ] Widgets de resumo personalizáveis
  - [ ] Timeline de atividades recentes
  - [ ] Quick actions panel
  - [ ] Filtros de período
  - [ ] Exportação de relatórios
  - [ ] Notificações em tempo real

### Fase 9 — Gestão de Tickets
- [ ] **Sistema de Tickets Avançado**
  - [x] Lista com filtros avançados e busca
  - [ ] Visualizações: lista, grid, kanban
  - [ ] Formulário de criação com validação
  - [ ] Página de detalhes com comentários
  - [ ] Sistema de anexos drag-and-drop
  - [ ] Labels e tags personalizáveis
  - [ ] Histórico de alterações
  - [ ] Notificações de status

### Fase 10 — Ordens de Serviço
- [ ] **Sistema de OS Completo**
  - [ ] Lista com múltiplas visualizações
  - [ ] Calendário de agendamentos
  - [ ] Formulário de criação avançado
  - [ ] Sistema de qualificação (rating + feedback)
  - [ ] Workflow de aprovação
  - [ ] Integração com mapas (futuro)
  - [ ] Relatórios de SLA
  - [ ] Assinatura digital (futuro)

### Fase 11 — Perfil e Configurações
- [ ] **Gestão de Perfil Avançada**
  - [ ] Página de perfil com edição inline
  - [ ] Upload de avatar com crop
  - [ ] Configurações de notificação
  - [ ] Preferências de tema
  - [ ] Histórico de atividades
  - [ ] Configurações de privacidade
  - [ ] Integração com 2FA (futuro)

### Fase 12 — UX Avançado e Performance
- [ ] **Experiência do Usuário**
  - [ ] Animações com framer-motion
  - [ ] Micro-interações
  - [ ] Loading skeletons
  - [ ] Estados vazios ilustrados
  - [ ] Feedback visual imediato
  - [ ] Atalhos de teclado
  - [ ] Navegação por voz (futuro)
  - [ ] Modo offline básico

- [ ] **Performance e Otimização**
  - [ ] Code splitting por rota
  - [ ] Lazy loading de componentes
  - [ ] Memoização estratégica
  - [ ] Virtual scrolling para listas grandes
  - [ ] Image optimization
  - [ ] Bundle analysis
  - [ ] Performance monitoring

### Fase 13 — Funcionalidades Avançadas
- [ ] **Recursos Premium**
  - [ ] Sistema de notificações em tempo real (WebSocket)
  - [ ] Colaboração em tempo real
  - [ ] Exportação avançada (PDF, Excel, CSV)
  - [ ] Busca global inteligente
  - [ ] Favoritos e bookmarks
  - [ ] Workspace personalizado
  - [ ] PWA com offline support
  - [ ] Integração com calendários externos

## Arquitetura do Frontend (Styled-Components)

### Estrutura de Pastas Profissional
```
src/
├── components/
│   ├── ui/                  # Componentes básicos (Atoms)
│   │   ├── Button/
│   │   │   ├── index.ts
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   ├── Button.types.ts
│   │   │   └── Button.stories.tsx
│   │   ├── Input/
│   │   ├── Text/
│   │   ├── Icon/
│   │   └── ...
│   ├── composite/           # Componentes compostos (Molecules)
│   │   ├── InputGroup/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── ...
│   ├── layout/              # Componentes de layout (Organisms)
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── DataTable/
│   │   └── ...
│   └── forms/               # Formulários especializados
│       ├── LoginForm/
│       ├── TicketForm/
│       └── ...
├── templates/               # Templates de página
│   ├── AuthTemplate/
│   ├── DashboardTemplate/
│   └── ...
├── pages/                   # Páginas da aplicação
│   ├── auth/
│   ├── dashboard/
│   ├── tickets/
│   └── ...
├── styles/                  # Sistema de design
│   ├── theme/
│   │   ├── index.ts
│   │   ├── light.ts
│   │   ├── dark.ts
│   │   └── types.ts
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   └── animations.ts
│   ├── breakpoints/
│   │   └── index.ts
│   ├── mixins/
│   │   ├── flexbox.ts
│   │   ├── grid.ts
│   │   └── responsive.ts
│   └── globalStyles.ts
├── hooks/                   # Custom hooks
├── services/                # Comunicação com API
├── types/                   # Interfaces TypeScript
├── utils/                   # Funções utilitárias
├── contexts/                # Contextos React
└── assets/                  # Imagens, ícones, etc.
```

### Padrão de Componentes Styled-Components

#### 1. Estrutura de Componente Base
```typescript
// Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Button/Button.styles.ts
import styled, { css } from 'styled-components';
import { ButtonProps } from './Button.types';

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
    &:hover {
      background-color: ${({ theme }) => theme.colors.primary.dark};
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.secondary.main};
    color: ${({ theme }) => theme.colors.secondary.contrast};
  `,
  // ... outras variantes
};

const sizeStyles = {
  small: css`
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  medium: css`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  `,
  // ... outros tamanhos
};

export const StyledButton = styled.button<ButtonProps>`
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  ${({ variant = 'primary' }) => variantStyles[variant]}
  ${({ size = 'medium' }) => sizeStyles[size]}
  
  ${({ disabled }) => disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
  `}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  ${({ loading }) => loading && css`
    position: relative;
    color: transparent;
  `}
`;

// Button/Button.tsx
import React from 'react';
import { StyledButton } from './Button.styles';
import { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  children,
  loading,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      disabled={disabled || loading}
      loading={loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </StyledButton>
  );
};

// Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

#### 2. Sistema de Temas
```typescript
// styles/tokens/colors.ts
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    900: '#0c4a6e',
    main: '#0ea5e9',
    dark: '#0284c7',
    light: '#e0f2fe',
    contrast: '#ffffff',
  },
  // ... outras cores
};

// styles/tokens/typography.ts
export const typography = {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"Fira Code", "Monaco", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// styles/theme/light.ts
import { colors, typography, spacing, shadows } from '../tokens';

export const lightTheme = {
  colors: {
    ...colors,
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      tertiary: '#94a3b8',
    },
  },
  typography,
  spacing,
  shadows,
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};
```

#### 3. Mixins Reutilizáveis
```typescript
// styles/mixins/flexbox.ts
import { css } from 'styled-components';

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

// styles/mixins/responsive.ts
import { css } from 'styled-components';

export const mobile = (styles: any) => css`
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    ${styles}
  }
`;

export const tablet = (styles: any) => css`
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) and (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    ${styles}
  }
`;

export const desktop = (styles: any) => css`
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    ${styles}
  }
`;
```

#### 4. Componentes Responsivos
```typescript
// components/layout/Container/Container.styles.ts
import styled from 'styled-components';
import { mobile, tablet, desktop } from '../../../styles/mixins/responsive';

export const Container = styled.div<{ maxWidth?: string }>`
  width: 100%;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  
  ${mobile`
    padding: 0 ${({ theme }) => theme.spacing.sm};
  `}
  
  ${tablet`
    max-width: ${({ theme }) => theme.breakpoints.md};
  `}
  
  ${desktop`
    max-width: ${({ maxWidth, theme }) => maxWidth || theme.breakpoints.xl};
  `}
`;
```

### Sistema de Customização Avançada

#### 1. Props Condicionais e Variantes
```typescript
// Exemplo de componente altamente customizável
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  clickable?: boolean;
}

export const StyledCard = styled.div<CardProps>`
  background-color: ${({ theme }) => theme.colors.background.primary};
  transition: ${({ theme }) => theme.transitions.default};
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'outlined':
        return css`
          border: 1px solid ${theme.colors.border.light};
        `;
      case 'elevated':
        return css`
          box-shadow: ${theme.shadows.md};
        `;
      case 'filled':
        return css`
          background-color: ${theme.colors.background.secondary};
        `;
      default:
        return css`
          border: 1px solid ${theme.colors.border.light};
        `;
    }
  }}
  
  ${({ padding, theme }) => {
    const paddingMap = {
      none: '0',
      small: theme.spacing.sm,
      medium: theme.spacing.md,
      large: theme.spacing.lg,
    };
    return css`
      padding: ${paddingMap[padding || 'medium']};
    `;
  }}
  
  ${({ hover, theme }) => hover && css`
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  `}
  
  ${({ clickable }) => clickable && css`
    cursor: pointer;
  `}
`;
```

### Convenções de Desenvolvimento com Styled-Components

#### 1. Nomenclatura e Organização
- **Arquivos de Estilo**: `ComponentName.styles.ts`
- **Tipos**: `ComponentName.types.ts`
- **Componente Principal**: `ComponentName.tsx`
- **Barrel Export**: `index.ts`
- **Stories (Storybook)**: `ComponentName.stories.tsx`

#### 2. Padrões de Props
- **Variantes**: usar union types (`'primary' | 'secondary'`)
- **Tamanhos**: padronizar (`'small' | 'medium' | 'large'`)
- **Estados**: boolean props (`disabled`, `loading`, `active`)
- **Customização**: props opcionais para override de estilos

#### 3. Performance e Otimização
- **Memoização**: usar `React.memo` para componentes pesados
- **Styled-components**: evitar criar styled-components dentro de render
- **Theme**: acessar tema via props, não via hooks dentro de styled-components
- **CSS-in-JS**: usar `css` helper para estilos condicionais complexos

#### 4. Acessibilidade
- **ARIA**: incluir atributos ARIA necessários
- **Keyboard Navigation**: suporte a navegação por teclado
- **Focus Management**: gerenciamento adequado de foco
- **Color Contrast**: garantir contraste adequado nas cores do tema

#### 5. Testes
- **Unit Tests**: testar lógica de componentes
- **Visual Tests**: usar Storybook para testes visuais
- **Accessibility Tests**: testes de acessibilidade automatizados
- **Theme Tests**: testar componentes com diferentes temas

### Convenções de Desenvolvimento Frontend (Styled-Components)

#### 1. Nomenclatura e Estrutura
- **Componentes**: PascalCase (`Button`, `InputGroup`, `DataTable`)
- **Arquivos**: camelCase para utilitários, PascalCase para componentes
- **Styled Components**: prefixo `Styled` (`StyledButton`, `StyledCard`)
- **Props Interfaces**: sufixo `Props` (`ButtonProps`, `CardProps`)
- **Theme Types**: sufixo `Type` (`ThemeType`, `ColorType`)

#### 2. Organização de Arquivos por Componente
```
Button/
├── index.ts              # Barrel export
├── Button.tsx            # Componente principal
├── Button.styles.ts      # Styled components
├── Button.types.ts       # Interfaces e tipos
├── Button.stories.tsx    # Storybook stories
├── Button.test.tsx       # Testes unitários
└── Button.md            # Documentação (opcional)
```

#### 3. Padrões de Implementação
- **Props**: sempre tipadas com interfaces TypeScript
- **Default Props**: usar destructuring com valores padrão
- **Forwarded Refs**: usar `React.forwardRef` quando necessário
- **Memoização**: `React.memo` para componentes que recebem props complexas
- **Hooks**: custom hooks para lógica reutilizável

#### 4. Sistema de Design Tokens
```typescript
// Hierarquia de tokens
tokens/
├── colors.ts           # Paleta de cores completa
├── typography.ts       # Sistema tipográfico
├── spacing.ts          # Escala de espaçamentos
├── shadows.ts          # Sombras e elevações
├── animations.ts       # Durações e easings
├── borders.ts          # Bordas e raios
└── zIndex.ts          # Escala de z-index
```

#### 5. Responsividade e Breakpoints
- **Mobile First**: sempre começar pelo mobile
- **Breakpoints**: usar sistema padronizado (xs, sm, md, lg, xl, 2xl)
- **Mixins**: criar mixins para media queries reutilizáveis
- **Container Queries**: preparar para container queries futuras

#### 6. Performance e Otimização
- **Bundle Splitting**: separar componentes por funcionalidade
- **Tree Shaking**: garantir que apenas código usado seja incluído
- **CSS-in-JS**: otimizar styled-components para produção
- **Lazy Loading**: carregar componentes sob demanda

#### 7. Acessibilidade (A11y)
- **WCAG 2.1**: seguir diretrizes de acessibilidade
- **Semantic HTML**: usar elementos semânticos corretos
- **ARIA**: implementar atributos ARIA quando necessário
- **Focus Management**: gerenciar foco adequadamente
- **Color Contrast**: garantir contraste mínimo de 4.5:1

#### 8. Testes e Qualidade
- **Unit Tests**: Jest + React Testing Library
- **Visual Regression**: Storybook + Chromatic
- **Accessibility Tests**: @testing-library/jest-dom
- **Type Safety**: TypeScript strict mode
- **Linting**: ESLint + Prettier + Stylelint

#### 9. Documentação e Storybook
- **Stories**: criar stories para todos os componentes
- **Controls**: usar Storybook controls para props
- **Docs**: documentação automática via Storybook
- **Design Tokens**: documentar tokens no Storybook

#### 10. Versionamento e Releases
- **Semantic Versioning**: seguir semver para releases
- **Changelog**: manter changelog atualizado
- **Breaking Changes**: documentar mudanças que quebram compatibilidade
- **Migration Guides**: guias de migração entre versões

### Exemplo de Implementação Completa

#### Design System Base
```typescript
// styles/tokens/index.ts
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';
export { animations } from './animations';
export { borders } from './borders';
export { zIndex } from './zIndex';

// styles/theme/index.ts
import * as tokens from '../tokens';

export const createTheme = (mode: 'light' | 'dark') => ({
  mode,
  ...tokens,
  colors: {
    ...tokens.colors,
    ...(mode === 'dark' ? darkColorOverrides : {}),
  },
});

// App.tsx
import { ThemeProvider } from 'styled-components';
import { createTheme } from './styles/theme';

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeProvider theme={createTheme(theme)}>
      <GlobalStyles />
      <Router>
        {/* App content */}
      </Router>
    </ThemeProvider>
  );
}
```

#### Componente Exemplo Completo
```typescript
// components/ui/Button/Button.types.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// components/ui/Button/Button.styles.ts
import styled, { css, keyframes } from 'styled-components';
import { ButtonProps } from './Button.types';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const baseStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-decoration: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.default};
  position: relative;
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary.dark};
    }
    
    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary.darker};
    }
  `,
  // ... outras variantes
};

const sizeStyles = {
  xs: css`
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    min-height: 24px;
  `,
  // ... outros tamanhos
};

export const StyledButton = styled.button<ButtonProps>`
  ${baseStyles}
  ${({ variant = 'primary' }) => variantStyles[variant]}
  ${({ size = 'md' }) => sizeStyles[size]}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  ${({ loading }) => loading && css`
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: ${spin} 1s linear infinite;
    }
  `}
`;

// components/ui/Button/Button.tsx
import React from 'react';
import { StyledButton } from './Button.styles';
import { ButtonProps } from './Button.types';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, leftIcon, rightIcon, loading, disabled, ...props }, ref) => {
    return (
      <StyledButton
        ref={ref}
        disabled={disabled || loading}
        loading={loading}
        {...props}
      >
        {leftIcon && !loading && leftIcon}
        {children}
        {rightIcon && !loading && rightIcon}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

// components/ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';

// components/ui/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};
```

Este roadmap atualizado fornece uma base sólida para construir um sistema de design profissional e escalável usando styled-components, com foco em reutilização, customização e manutenibilidade.

---

## Continuação — Refinamentos de Frontend (Nov/2025)

### Fase 14 — Polimento de Tabelas e Formulários
- Sticky Header para Tabelas
  - Adicionar `className="table--sticky-header"` nas tabelas que exigem cabeçalho fixo
  - Garantir `z-index` adequado (use `zIndex.table.header` ou `10`)
  - Aplicar `backdrop-filter` sutil para modernidade e separação visual
- Toolbar de Filtros
  - Introduzir container `.table-toolbar` com layout flex responsivo
  - Agrupar busca e filtros em `.table-toolbar__filters`
  - Padronizar espaçamentos e raios: `gap: 12px`, `border-radius: 12px`
- Inputs e Selects (versão class-based)
  - Estilos globais para `.input`, `.select` e wrappers (`.input-group`, `.select-wrapper`, `.select-container`)
  - Focus ring consistente (`border-color: primary` + `box-shadow` suave)
  - Variantes: `default`, `filled`, `outlined`, estados de `error` e `disabled`
- Contraste e Acessibilidade
  - Texto escuro em linhas alternadas e no hover para manter legibilidade
  - Seguir WCAG 2.1 AA (contraste mínimo 4.5:1)

### Fase 15 — Botões e Interações
- Variantes adicionais de Button (class-based)
  - `accent` e `outline` adicionadas a `ui.css` com hover coerente
  - Base, tamanhos (`sm`, `md`, `lg`) e `fullWidth`
- Estados
  - Loading e Disabled consistentes entre UI e atoms
  - Ícones alinhados via `.btn__icon` e conteúdo via `.btn__content`

### Entregas Realizadas
- Tabelas com `sticky header` em Providers List
- Toolbar moderna para filtros (busca, status, plano, ação)
- Correções de contraste para linhas listradas, hover e seleção
- Botões `accent` e `outline` integrados ao sistema de cores

### Próximos Passos
- Generalizar `sticky header` como prop do componente `Table` (`stickyHeader?: boolean`)
- Adotar ícones de ordenação modernos (SVG) e estados de `sortable`
- Unificar estilos de toolbar nas páginas de `Tickets` e `ServiceOrders`
- Criar componente `DataTable` (organism) com sorting, filtering e paginação integrados
- Storybook: stories para `Table` com `striped`, `hoverable`, `bordered`, `stickyHeader`
- Testes de acessibilidade (foco, roles, cabeçalhos `scope="col"`)

### Critérios de Aceite
- Cabeçalho da tabela permanece visível ao rolar e não sobrepõe conteúdo
- Foco visível em Inputs/Selects com realce padronizado
- Contraste do texto nas linhas listradas/hover/selecionadas atende WCAG AA
- Toolbar se adapta a telas menores e mantém ação principal acessível

### Guia Rápido de Implementação
- Sticky Header
  - Use: `<Table className="table--sticky-header" ...>`
  - Verifique containers com `overflow` para que o sticky funcione
- Toolbar
  - Use os wrappers `.table-toolbar` e `.table-toolbar__filters`
  - Combine com `Input`/`Select` class-based para compatibilidade imediata
- Inputs/Selects
  - Classes: `.input`, `.select`, variantes `--filled`, `--outlined`, `--error`, `--disabled`
  - Ícone do select via `.select-icon` posicionado por CSS

### Observações de Tema
- Migrar gradualmente hardcodes em `ui.css` para CSS variables do tema (`globalStyles.ts`)
- Garantir coerência entre `styled-components` (atoms) e classes globais (ui)

Atualização: Novembro 2025