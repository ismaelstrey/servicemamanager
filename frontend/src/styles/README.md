# Sistema de Estilos TelecomAI

Este diretório contém o sistema de design e estilos do projeto TelecomAI.

## Arquivos

- `theme.ts` - Definições do tema (cores, tipografia, espaçamentos)
- `GlobalStyles.ts` - Estilos globais da aplicação
- `index.css` - Estilos base e reset CSS

## Tema

O tema é centralizado e fornece consistência visual em toda a aplicação.

### Estrutura do Tema

```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    // ... outras cores
  };
  typography: {
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: Record<string, string>;
}
```

### Cores

O sistema de cores inclui:

- **Primary**: Cor principal da marca
- **Secondary**: Cor secundária
- **Tertiary**: Cor terciária
- **Success**: Verde para estados de sucesso
- **Warning**: Amarelo para avisos
- **Error**: Vermelho para erros
- **Background**: Cores de fundo
- **Text**: Cores de texto
- **Border**: Cores de bordas

### Tipografia

Sistema tipográfico baseado em:

- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl
- **Font Weights**: light (300), normal (400), medium (500), semibold (600), bold (700)
- **Line Heights**: tight, normal, relaxed

### Espaçamentos

Sistema de espaçamento baseado em múltiplos de 4px:

- `xs`: 4px
- `sm`: 8px  
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

### Breakpoints

Pontos de quebra responsivos:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Como Usar

### Em Styled Components

```tsx
import styled from 'styled-components';

const StyledComponent = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;
```

### Com ThemeProvider

```tsx
import { ThemeProvider } from 'styled-components';
import { theme } from '@/styles/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Sua aplicação */}
    </ThemeProvider>
  );
}
```

## Padrões de Estilização

### 1. Mobile First

Sempre comece com estilos mobile e adicione breakpoints maiores:

```tsx
const Component = styled.div`
  /* Mobile (padrão) */
  padding: ${({ theme }) => theme.spacing.sm};
  
  /* Tablet e acima */
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
  
  /* Desktop e acima */
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;
```

### 2. Variantes de Componente

Use props para criar variantes:

```tsx
const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
        `;
      case 'secondary':
        return `
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.white};
        `;
    }
  }}
`;
```

### 3. Estados Interativos

Defina estados hover, focus e active:

```tsx
const InteractiveElement = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
```

### 4. Animações

Use transições suaves para melhor UX:

```tsx
const AnimatedComponent = styled.div`
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;
```

## Acessibilidade

### Contraste de Cores

Todas as combinações de cores seguem as diretrizes WCAG 2.1:

- **AA Normal**: Contraste mínimo de 4.5:1
- **AA Large**: Contraste mínimo de 3:1
- **AAA**: Contraste mínimo de 7:1

### Estados de Foco

Sempre forneça indicadores visuais claros para foco:

```tsx
const AccessibleButton = styled.button`
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
`;
```

## Utilitários

### Mixins Comuns

```tsx
// Centralizar conteúdo
const centerContent = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Truncar texto
const truncateText = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Sombra de elevação
const elevationShadow = (level: number) => css`
  box-shadow: ${({ theme }) => theme.shadows[`elevation${level}`]};
`;
```

## Melhores Práticas

1. **Use o tema**: Sempre referencie valores do tema em vez de hardcode
2. **Mobile first**: Comece com mobile e adicione breakpoints maiores
3. **Consistência**: Use os mesmos padrões em toda a aplicação
4. **Performance**: Evite re-renderizações desnecessárias
5. **Acessibilidade**: Considere usuários com necessidades especiais
6. **Manutenibilidade**: Mantenha estilos organizados e documentados

---

**Última atualização**: Janeiro 2025