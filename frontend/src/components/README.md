# Componentes TelecomAI

Esta pasta contém todos os componentes React do projeto TelecomAI, organizados seguindo a metodologia Atomic Design.

## Estrutura

```
components/
├── ui/                    # Componentes básicos reutilizáveis
├── atoms/                 # Componentes atômicos (elementos básicos)
├── molecules/             # Componentes moleculares (combinação de átomos)
├── organisms/             # Componentes organizacionais (seções complexas)
├── templates/             # Templates de layout
├── layout/               # Componentes de layout geral
├── auth/                 # Componentes específicos de autenticação
├── dashboard/            # Componentes específicos do dashboard
├── forms/                # Componentes de formulários
└── common/               # Componentes comuns/utilitários
```

## Componentes Disponíveis

### UI Components (Básicos)
- **Button**: Botões com diferentes variantes e tamanhos
- **Input**: Campos de entrada com validação
- **Text**: Componente de texto tipográfico
- **Card**: Container com diferentes estilos

### Templates
- **AuthTemplate**: Template para páginas de autenticação

## Como Usar

### Importação
```tsx
// Componentes UI básicos
import { Button, Input, Text, Card } from '@/components/ui';

// Templates
import { AuthTemplate } from '@/components/templates';

// Componentes específicos
import { LoginForm } from '@/components/auth';
```

### Exemplo Básico
```tsx
import React from 'react';
import { Button, Input, Text } from '@/components/ui';
import { AuthTemplate } from '@/components/templates';

const LoginPage = () => {
  return (
    <AuthTemplate title="Login" subtitle="Entre na sua conta">
      <Input label="Email" type="email" />
      <Input label="Senha" type="password" />
      <Button variant="primary" fullWidth>
        Entrar
      </Button>
    </AuthTemplate>
  );
};
```

## Padrões

### 1. Estrutura de Componente
Cada componente deve ter sua própria pasta com:
- `ComponentName.tsx` - Componente principal
- `ComponentName.styles.ts` - Estilos styled-components
- `index.ts` - Exportações

### 2. TypeScript
Todos os componentes devem ser tipados:
```tsx
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ variant = 'primary', children }) => {
  return <StyledComponent variant={variant}>{children}</StyledComponent>;
};
```

### 3. Styled Components
Use o tema para consistência:
```tsx
import styled from 'styled-components';

const StyledComponent = styled.div<{ variant: string }>`
  color: ${({ theme, variant }) => theme.colors[variant]};
  padding: ${({ theme }) => theme.spacing.md};
`;
```

### 4. Responsividade
Siga o padrão mobile-first:
```tsx
const ResponsiveComponent = styled.div`
  /* Mobile */
  padding: 1rem;
  
  /* Tablet */
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;
```

## Contribuindo

1. **Crie uma nova pasta** para o componente
2. **Siga a estrutura padrão** de arquivos
3. **Use TypeScript** para tipagem
4. **Implemente styled-components** com tema
5. **Considere acessibilidade** (ARIA, navegação por teclado)
6. **Teste responsividade** em diferentes dispositivos
7. **Documente** props e exemplos de uso

## Links Úteis

- [Documentação Completa](../COMPONENTS.md)
- [Guia de Estilo](../src/styles/README.md)
- [Tema](../src/styles/theme.ts)

---

Para mais informações, consulte a [documentação completa](../COMPONENTS.md).