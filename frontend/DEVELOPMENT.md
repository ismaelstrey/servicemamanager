# Guia de Desenvolvimento - TelecomAI Frontend

Este documento estabelece os padrões e convenções para desenvolvimento do frontend da aplicação TelecomAI.

## Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Styled Components** - CSS-in-JS
- **React Router** - Roteamento
- **ESLint + Prettier** - Linting e formatação

## Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes básicos reutilizáveis
│   ├── templates/       # Templates de layout
│   ├── auth/            # Componentes de autenticação
│   └── ...
├── pages/               # Páginas da aplicação
├── styles/              # Sistema de estilos e tema
├── hooks/               # Custom hooks
├── utils/               # Funções utilitárias
├── services/            # Serviços e APIs
├── types/               # Definições de tipos TypeScript
└── assets/              # Recursos estáticos
```

## Convenções de Nomenclatura

### Arquivos e Pastas

- **Componentes**: PascalCase (`Button.tsx`, `AuthTemplate.tsx`)
- **Páginas**: PascalCase (`LoginPage.tsx`, `DashboardPage.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.ts`, `useApi.ts`)
- **Utilitários**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`, `ROUTES.ts`)

### Variáveis e Funções

```typescript
// Variáveis: camelCase
const userName = 'João';
const isAuthenticated = true;

// Funções: camelCase
const handleSubmit = () => {};
const validateForm = () => {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Tipos e Interfaces: PascalCase
interface UserData {
  id: string;
  name: string;
}

type ButtonVariant = 'primary' | 'secondary';
```

## Padrões de Componentes

### Estrutura Básica

```typescript
import React from 'react';
import { StyledComponent } from './Component.styles';

interface ComponentProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  children,
  onClick,
}) => {
  return (
    <StyledComponent variant={variant} onClick={onClick}>
      {children}
    </StyledComponent>
  );
};
```

### Props Interface

- Use interface para props de componentes
- Defina valores padrão nos parâmetros da função
- Use tipos union para variantes limitadas
- Documente props complexas com JSDoc

```typescript
interface ButtonProps {
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Se o botão deve ocupar toda a largura */
  fullWidth?: boolean;
  /** Estado de carregamento */
  loading?: boolean;
  /** Função chamada ao clicar */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Conteúdo do botão */
  children: React.ReactNode;
}
```

### Styled Components

```typescript
import styled, { css } from 'styled-components';

interface StyledButtonProps {
  variant: 'primary' | 'secondary';
  fullWidth: boolean;
  loading: boolean;
}

export const StyledButton = styled.button<StyledButtonProps>`
  /* Estilos base */
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  
  /* Largura condicional */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  /* Estado de carregamento */
  ${({ loading }) => loading && css`
    opacity: 0.7;
    cursor: not-allowed;
  `}
  
  /* Variantes */
  ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryDark};
          }
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondaryDark};
          }
        `;
    }
  }}
  
  /* Estados de acessibilidade */
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
```

## Padrões de Páginas

### Estrutura de Página

```typescript
import React from 'react';
import { AuthTemplate } from '@/components/templates';
import { LoginForm } from '@/components/auth';

const LoginPage: React.FC = () => {
  return (
    <AuthTemplate
      title="Entrar"
      subtitle="Acesse sua conta TelecomAI"
    >
      <LoginForm />
    </AuthTemplate>
  );
};

export default LoginPage;
```

### Roteamento

```typescript
// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);
```

## Padrões de Estado

### useState

```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Custom Hooks

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return { user, loading, login, logout };
};
```

## Tratamento de Erros

### Componente de Erro

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Algo deu errado!</h2>
          <p>Ocorreu um erro inesperado. Tente recarregar a página.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Tratamento de Erros Assíncronos

```typescript
const handleSubmit = async (data: FormData) => {
  setLoading(true);
  setError(null);
  
  try {
    await submitForm(data);
    // Sucesso
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('Ocorreu um erro inesperado');
    }
  } finally {
    setLoading(false);
  }
};
```

## Acessibilidade

### Diretrizes WCAG

1. **Contraste**: Mínimo 4.5:1 para texto normal
2. **Navegação por teclado**: Todos os elementos interativos
3. **ARIA labels**: Para elementos sem texto visível
4. **Foco visível**: Indicadores claros de foco

### Implementação

```typescript
const AccessibleButton = styled.button`
  /* Foco visível */
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  /* Remove outline apenas quando não usando teclado */
  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

// Uso de ARIA
<button
  aria-label="Fechar modal"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <CloseIcon />
</button>
```

## Performance

### Otimizações

1. **React.memo**: Para componentes que re-renderizam frequentemente
2. **useMemo**: Para cálculos custosos
3. **useCallback**: Para funções passadas como props
4. **Lazy loading**: Para componentes grandes

```typescript
// React.memo
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* renderização custosa */}</div>;
});

// useMemo
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// useCallback
const handleClick = useCallback(() => {
  onItemClick(item.id);
}, [item.id, onItemClick]);

// Lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

## Testes

### Estrutura de Teste

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Formatação
npm run format

# Testes
npm run test
npm run test:watch
npm run test:coverage
```

## Melhores Práticas

1. **Componentes pequenos**: Mantenha componentes focados em uma responsabilidade
2. **Props explícitas**: Evite prop drilling, use Context quando necessário
3. **Tipagem forte**: Use TypeScript para prevenir erros
4. **Testes**: Escreva testes para lógica crítica
5. **Performance**: Monitore re-renderizações desnecessárias
6. **Acessibilidade**: Considere usuários com necessidades especiais
7. **Documentação**: Mantenha documentação atualizada

---

**Última atualização**: Janeiro 2025