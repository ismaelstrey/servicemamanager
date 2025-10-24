# Documentação dos Componentes UI

Este documento descreve os componentes UI criados para o projeto TelecomAI e os padrões estabelecidos para desenvolvimento frontend.

## Arquitetura de Componentes

### Estrutura de Pastas

```
src/components/
├── ui/                    # Componentes básicos reutilizáveis
│   ├── Button/
│   ├── Input/
│   ├── Text/
│   └── Card/
├── templates/             # Templates de layout
│   └── AuthTemplate/
├── atoms/                 # Componentes atômicos
├── molecules/             # Componentes moleculares
├── organisms/             # Componentes organizacionais
└── layout/               # Componentes de layout
```

## Componentes UI Básicos

### Button Component

**Localização**: `src/components/ui/Button/`

**Props**:
- `variant`: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
- `size`: 'small' | 'medium' | 'large'
- `fullWidth`: boolean
- `disabled`: boolean
- `loading`: boolean
- `children`: React.ReactNode

**Exemplo de uso**:
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="large" fullWidth>
  Entrar
</Button>
```

### Input Component

**Localização**: `src/components/ui/Input/`

**Props**:
- `label`: string
- `type`: 'text' | 'email' | 'password' | 'number'
- `placeholder`: string
- `error`: string
- `disabled`: boolean
- `fullWidth`: boolean
- `required`: boolean
- `value`: string
- `onChange`: (e: ChangeEvent<HTMLInputElement>) => void

**Exemplo de uso**:
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  fullWidth
/>
```

### Text Component

**Localização**: `src/components/ui/Text/`

**Props**:
- `variant`: 'body1' | 'body2' | 'caption' | 'overline' | 'subtitle1' | 'subtitle2'
- `size`: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
- `weight`: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
- `color`: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'success' | 'warning' | 'error'
- `align`: 'left' | 'center' | 'right' | 'justify'
- `transform`: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
- `truncate`: boolean
- `as`: keyof JSX.IntrinsicElements

**Exemplo de uso**:
```tsx
import { Text } from '@/components/ui/Text';

<Text variant="body1" color="primary" weight="medium">
  Bem-vindo ao TelecomAI
</Text>
```

### Card Component

**Localização**: `src/components/ui/Card/`

**Props**:
- `variant`: 'default' | 'outlined' | 'elevated'
- `padding`: 'none' | 'small' | 'medium' | 'large'
- `children`: React.ReactNode
- `className`: string

**Exemplo de uso**:
```tsx
import { Card } from '@/components/ui/Card';

<Card variant="elevated" padding="large">
  <Text>Conteúdo do card</Text>
</Card>
```

## Templates

### AuthTemplate

**Localização**: `src/components/templates/AuthTemplate/`

Template responsivo para páginas de autenticação com design moderno e suporte a temas.

**Props**:
- `children`: React.ReactNode
- `title`: string
- `subtitle`: string (opcional)
- `showLogo`: boolean (padrão: true)
- `backgroundImage`: string (opcional)
- `className`: string (opcional)

**Características**:
- Layout centralizado e responsivo
- Suporte a imagem de fundo ou gradiente
- Logo configurável
- Padrão visual consistente
- Animações suaves

**Exemplo de uso**:
```tsx
import { AuthTemplate } from '@/components/templates/AuthTemplate';

<AuthTemplate
  title="Entrar na sua conta"
  subtitle="Bem-vindo de volta ao TelecomAI"
>
  {/* Formulário de login */}
</AuthTemplate>
```

## Padrões de Desenvolvimento

### 1. Styled Components

Todos os componentes utilizam `styled-components` para estilização:

```tsx
import styled from 'styled-components';

const StyledButton = styled.button<{ variant: string }>`
  background-color: ${({ theme, variant }) => theme.colors[variant]};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;
```

### 2. Tema e Design System

O tema está centralizado em `src/styles/theme.ts` e inclui:

- **Cores**: Paleta consistente para diferentes estados
- **Tipografia**: Tamanhos, pesos e alturas de linha
- **Espaçamentos**: Sistema de espaçamento baseado em múltiplos
- **Bordas**: Raios de borda padronizados
- **Sombras**: Elevações consistentes

### 3. Responsividade

Todos os componentes seguem o padrão mobile-first:

```tsx
const ResponsiveComponent = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;
```

### 4. Acessibilidade

- Suporte a navegação por teclado
- Labels apropriados para screen readers
- Contraste adequado de cores
- Estados de foco visíveis

### 5. TypeScript

Todos os componentes são tipados com TypeScript:

```tsx
interface ComponentProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ variant, children, onClick }) => {
  // implementação
};
```

## Convenções de Nomenclatura

### Arquivos
- Componentes: `PascalCase.tsx`
- Estilos: `PascalCase.styles.ts`
- Tipos: `PascalCase.types.ts` (quando necessário)
- Index: `index.ts`

### Componentes
- Nomes em PascalCase
- Props em camelCase
- Styled components com prefixo "Styled"

### Variáveis CSS
- Propriedades do tema em camelCase
- Classes CSS em kebab-case quando necessário

## Próximos Passos

1. **Storybook**: Documentação interativa dos componentes
2. **Testes**: Testes unitários com Jest e Testing Library
3. **Mais Componentes**: Modal, Dropdown, Tooltip, etc.
4. **Animações**: Biblioteca de animações consistente
5. **Ícones**: Sistema de ícones padronizado

## Contribuição

Ao criar novos componentes:

1. Siga a estrutura de pastas estabelecida
2. Use TypeScript para tipagem
3. Implemente styled-components com tema
4. Considere responsividade e acessibilidade
5. Documente props e exemplos de uso
6. Teste em diferentes dispositivos

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0